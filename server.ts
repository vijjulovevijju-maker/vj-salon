import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getDb,
  mutateDb,
  verifyAdminLogin,
  isTokenValid,
  updateAdminCredentials,
  getAvailableSlotsForDate,
  generateBookingId,
  calculateDashboardStats,
  parseTimeToMinutes,
} from './server/db.js';
import type { Booking, ServiceItem, SalonSettings, BlockedPeriod, BookingStatus } from './src/types.js';

// Initialize DB on startup
initDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS / headers for local requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Admin Auth Middleware
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token || !isTokenValid(token)) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    }
    next();
  }

  // ==========================================
  // CUSTOMER PUBLIC APIS
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Salon Info
  app.get('/api/salon/info', (req, res) => {
    const db = getDb();
    res.json(db.settings);
  });

  // Active Services
  app.get('/api/services', (req, res) => {
    const db = getDb();
    const activeServices = db.services.filter((s) => s.active);
    res.json(activeServices);
  });

  // Available Slots for a given date
  app.get('/api/slots', (req, res) => {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const slots = getAvailableSlotsForDate(date);
    res.json({ date, slots });
  });

  // Customer creates booking
  app.post('/api/bookings', async (req, res) => {
    try {
      const { customerName, mobileNumber, serviceIds, appointmentDate, appointmentTime, customerMessage } = req.body;

      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        return res.status(400).json({ error: 'Please enter a valid customer name (minimum 2 characters)' });
      }

      const cleanMobile = String(mobileNumber || '').replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
      }

      if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
        return res.status(400).json({ error: 'Please select at least one service' });
      }

      if (!appointmentDate || !appointmentTime) {
        return res.status(400).json({ error: 'Please select appointment date and time slot' });
      }

      // Check if date is in the past
      const todayStr = new Date().toISOString().split('T')[0];
      if (appointmentDate < todayStr) {
        return res.status(400).json({ error: 'Cannot book appointments for past dates' });
      }

      const db = getDb();
      // Map selected services
      const selectedServicesList: ServiceItem[] = [];
      for (const sId of serviceIds) {
        const found = db.services.find((s) => s.id === sId && s.active);
        if (found) {
          selectedServicesList.push(found);
        }
      }

      if (selectedServicesList.length === 0) {
        return res.status(400).json({ error: 'The selected services are currently unavailable. Please re-select.' });
      }

      const totalAmount = selectedServicesList.reduce((acc, s) => acc + s.price, 0);
      const totalDuration = selectedServicesList.reduce((acc, s) => acc + s.duration, 0);

      // Perform atomic double-booking check & booking creation via mutateDb
      const newBooking = await mutateDb<Booking>((database) => {
        // Check slot availability again inside mutex lock
        const currentSlots = getAvailableSlotsForDate(appointmentDate);
        const slotMatch = currentSlots.find(
          (s) => s.time === appointmentTime || s.displayTime.toLowerCase() === appointmentTime.toLowerCase()
        );

        if (!slotMatch || !slotMatch.available) {
          throw new Error('DOUBLE_BOOKED');
        }

        const bookingId = generateBookingId();
        const created: Booking = {
          id: bookingId,
          customerName: customerName.trim(),
          mobileNumber: cleanMobile,
          selectedServices: selectedServicesList.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
          })),
          totalAmount,
          totalDuration: Math.max(database.settings.slotDuration || 30, totalDuration),
          appointmentDate,
          appointmentTime: slotMatch.displayTime,
          bookingStatus: 'Confirmed', // Automatically confirmed for seamless experience
          customerMessage: customerMessage?.trim() || '',
          createdDateTime: new Date().toISOString(),
          isWalkIn: false,
        };

        database.bookings.unshift(created);
        return created;
      });

      res.status(201).json({
        success: true,
        booking: newBooking,
        salon: db.settings,
      });
    } catch (err: any) {
      if (err.message === 'DOUBLE_BOOKED') {
        return res.status(409).json({
          error: 'Sorry, this time slot is no longer available. Please select another time.',
        });
      }
      console.error('Booking creation error:', err);
      res.status(500).json({ error: 'Failed to process booking. Please try again.' });
    }
  });

  // Customer My Bookings lookup
  app.get('/api/my-bookings', (req, res) => {
    const mobile = String(req.query.mobile || '').replace(/\D/g, '');
    const bookingId = (req.query.bookingId as string)?.trim().toUpperCase();

    if (!mobile && !bookingId) {
      return res.status(400).json({ error: 'Please provide either mobile number or Booking ID' });
    }

    const db = getDb();
    let matches = db.bookings.filter((b) => {
      if (bookingId && b.id.toUpperCase() === bookingId) return true;
      if (mobile && b.mobileNumber.endsWith(mobile.slice(-10))) return true;
      return false;
    });

    // Sort upcoming first
    matches = matches.sort((a, b) => b.createdDateTime.localeCompare(a.createdDateTime));

    res.json({ bookings: matches });
  });

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = verifyAdminLogin(username, password);
    if (!result.success) {
      return res.status(401).json({ error: result.error || 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: result.token,
      username: username.trim(),
    });
  });

  app.get('/api/admin/verify', requireAdmin, (req, res) => {
    const db = getDb();
    res.json({ success: true, username: db.admin.username });
  });

  app.post('/api/admin/change-credentials', requireAdmin, async (req, res) => {
    const { newUsername, newPassword } = req.body;
    if (!newUsername && !newPassword) {
      return res.status(400).json({ error: 'No changes provided' });
    }
    try {
      const updated = await updateAdminCredentials(newUsername, newPassword);
      res.json({ success: true, ...updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update credentials' });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD & BOOKINGS MANAGEMENT
  // ==========================================

  app.get('/api/admin/dashboard-stats', requireAdmin, (req, res) => {
    const stats = calculateDashboardStats();
    res.json(stats);
  });

  app.get('/api/admin/bookings', requireAdmin, (req, res) => {
    const db = getDb();
    const { search, date, status } = req.query;

    let filtered = [...db.bookings];

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.mobileNumber.includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }

    if (date && typeof date === 'string') {
      filtered = filtered.filter((b) => b.appointmentDate === date);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      filtered = filtered.filter((b) => b.bookingStatus === status);
    }

    // Sort newest booking first or by appointment date/time
    filtered.sort((a, b) => {
      const dateDiff = b.appointmentDate.localeCompare(a.appointmentDate);
      if (dateDiff !== 0) return dateDiff;
      return parseTimeToMinutes(b.appointmentTime) - parseTimeToMinutes(a.appointmentTime);
    });

    res.json(filtered);
  });

  // Admin changes booking status
  app.patch('/api/admin/bookings/:id/status', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: BookingStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    try {
      const updated = await mutateDb((db) => {
        const target = db.bookings.find((b) => b.id === id);
        if (!target) return null;
        target.bookingStatus = status;
        return target;
      });

      if (!updated) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json({ success: true, booking: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  });

  // Admin manually creates walk-in or phone booking
  app.post('/api/admin/walkin-booking', requireAdmin, async (req, res) => {
    try {
      const { customerName, mobileNumber, serviceIds, appointmentDate, appointmentTime, customerMessage } = req.body;

      if (!customerName || !appointmentDate || !appointmentTime) {
        return res.status(400).json({ error: 'Customer name, appointment date and time are required' });
      }

      const db = getDb();
      const selectedServicesList: ServiceItem[] = [];
      for (const sId of serviceIds || []) {
        const found = db.services.find((s) => s.id === sId);
        if (found) selectedServicesList.push(found);
      }

      const totalAmount = selectedServicesList.reduce((acc, s) => acc + s.price, 0);
      const totalDuration = selectedServicesList.reduce((acc, s) => acc + s.duration, 0) || 30;

      const newBooking = await mutateDb((database) => {
        const bookingId = generateBookingId();
        const created: Booking = {
          id: bookingId,
          customerName: customerName.trim(),
          mobileNumber: String(mobileNumber || 'Walk-in').replace(/\D/g, '') || '9999999999',
          selectedServices: selectedServicesList.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
          })),
          totalAmount,
          totalDuration,
          appointmentDate,
          appointmentTime,
          bookingStatus: 'Confirmed',
          customerMessage: customerMessage?.trim() || 'Walk-in appointment created by Admin',
          createdDateTime: new Date().toISOString(),
          isWalkIn: true,
        };

        database.bookings.unshift(created);
        return created;
      });

      res.status(201).json({ success: true, booking: newBooking });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // Delete booking
  app.delete('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await mutateDb((db) => {
        const idx = db.bookings.findIndex((b) => b.id === id);
        if (idx === -1) return false;
        db.bookings.splice(idx, 1);
        return true;
      });

      if (!deleted) return res.status(404).json({ error: 'Booking not found' });
      res.json({ success: true, message: 'Booking removed' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  });

  // ==========================================
  // ADMIN SERVICE MANAGEMENT
  // ==========================================

  app.get('/api/admin/services', requireAdmin, (req, res) => {
    const db = getDb();
    res.json(db.services);
  });

  app.post('/api/admin/services', requireAdmin, async (req, res) => {
    const { name, price, duration, category, description, active, popular } = req.body;
    if (!name || price === undefined || !duration) {
      return res.status(400).json({ error: 'Service name, price and duration are required' });
    }

    try {
      const created = await mutateDb((db) => {
        const newService: ServiceItem = {
          id: `srv-${Date.now()}`,
          name: name.trim(),
          price: Number(price),
          duration: Number(duration),
          category: category?.trim() || 'General Grooming',
          description: description?.trim() || '',
          active: active !== false,
          popular: !!popular,
        };
        db.services.push(newService);
        return newService;
      });

      res.status(201).json({ success: true, service: created });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to add service' });
    }
  });

  app.put('/api/admin/services/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, price, duration, category, description, active, popular } = req.body;

    try {
      const updated = await mutateDb((db) => {
        const target = db.services.find((s) => s.id === id);
        if (!target) return null;

        if (name) target.name = name.trim();
        if (price !== undefined) target.price = Number(price);
        if (duration !== undefined) target.duration = Number(duration);
        if (category) target.category = category.trim();
        if (description !== undefined) target.description = description.trim();
        if (active !== undefined) target.active = !!active;
        if (popular !== undefined) target.popular = !!popular;

        return target;
      });

      if (!updated) return res.status(404).json({ error: 'Service not found' });
      res.json({ success: true, service: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  app.delete('/api/admin/services/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const removed = await mutateDb((db) => {
        const idx = db.services.findIndex((s) => s.id === id);
        if (idx === -1) return false;
        db.services.splice(idx, 1);
        return true;
      });

      if (!removed) return res.status(404).json({ error: 'Service not found' });
      res.json({ success: true, message: 'Service removed successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // ==========================================
  // ADMIN SETTINGS & TIME MANAGEMENT
  // ==========================================

  app.get('/api/admin/settings', requireAdmin, (req, res) => {
    const db = getDb();
    res.json({
      settings: db.settings,
      blockedPeriods: db.blockedPeriods,
    });
  });

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    const updates = req.body;
    try {
      const updated = await mutateDb((db) => {
        db.settings = {
          ...db.settings,
          ...updates,
        };
        return db.settings;
      });
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Block full date or specific time slot
  app.post('/api/admin/blocked-periods', requireAdmin, async (req, res) => {
    const { date, startTime, endTime, reason } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required for blocking' });
    }

    try {
      const created = await mutateDb((db) => {
        const newBlock: BlockedPeriod = {
          id: `block-${Date.now()}`,
          date: date.trim(),
          startTime: startTime ? startTime.trim() : 'ALL_DAY',
          endTime: endTime ? endTime.trim() : undefined,
          reason: reason?.trim() || 'Blocked by admin',
        };
        db.blockedPeriods.push(newBlock);
        return newBlock;
      });
      res.status(201).json({ success: true, blockedPeriod: created });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to block time period' });
    }
  });

  app.delete('/api/admin/blocked-periods/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const removed = await mutateDb((db) => {
        const idx = db.blockedPeriods.findIndex((b) => b.id === id);
        if (idx === -1) return false;
        db.blockedPeriods.splice(idx, 1);
        return true;
      });

      if (!removed) return res.status(404).json({ error: 'Blocked period not found' });
      res.json({ success: true, message: 'Unblocked successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to remove blocked period' });
    }
  });

  // Serve public assets explicitly (icons, manifest.json)
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(publicDir, 'manifest.json'));
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC SERVE (PROD)
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VJ Salon server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VJ Salon server:', err);
  process.exit(1);
});
