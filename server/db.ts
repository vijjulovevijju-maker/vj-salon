import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Booking, ServiceItem, SalonSettings, BlockedPeriod, DashboardStats } from '../src/types.js';

interface AdminCredentials {
  username: string;
  passwordHash: string; // SHA-256
  salt: string;
}

interface DatabaseSchema {
  settings: SalonSettings;
  services: ServiceItem[];
  bookings: Booking[];
  blockedPeriods: BlockedPeriod[];
  admin: AdminCredentials;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'salon_db.json');

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Haircut + Beard',
    price: 100,
    duration: 45,
    active: true,
    category: 'Combo Combos',
    description: 'Complete grooming package with custom stylish haircut and sharp beard trimming & shaping.',
    popular: true,
  },
  {
    id: 'srv-2',
    name: 'Haircut',
    price: 60,
    duration: 30,
    active: true,
    category: 'Hair & Styling',
    description: 'Precision haircut tailored to face shape with side fade, scissor cut and hair styling.',
    popular: true,
  },
  {
    id: 'srv-3',
    name: 'Beard Set',
    price: 50,
    duration: 20,
    active: true,
    category: 'Beard & Shave',
    description: 'Expert beard line shaping, scissor trim, edge detailing and beard oil finish.',
    popular: true,
  },
  {
    id: 'srv-4',
    name: 'Clean Shave',
    price: 40,
    duration: 20,
    active: true,
    category: 'Beard & Shave',
    description: 'Traditional close shave with hot towel prep, rich lather and cooling aftershave lotion.',
  },
  {
    id: 'srv-5',
    name: 'Scrub',
    price: 50,
    duration: 20,
    active: true,
    category: 'Face & Skin',
    description: 'Deep pore exfoliating facial scrub to clear blackheads, dust and dead skin cells.',
  },
  {
    id: 'srv-6',
    name: 'Scrub Machine',
    price: 100,
    duration: 30,
    active: true,
    category: 'Face & Skin',
    description: 'High-frequency rotary scrub machine treatment for intense skin renewal and glowing texture.',
  },
  {
    id: 'srv-7',
    name: 'Massage',
    price: 100,
    duration: 30,
    active: true,
    category: 'Relaxation & Spa',
    description: 'Stress-relieving head, neck and shoulder acupressure massage with Ayurvedic oils.',
    popular: true,
  },
  {
    id: 'srv-8',
    name: 'Haircut + D-Tan',
    price: 250,
    duration: 60,
    active: true,
    category: 'Combo Combos',
    description: 'Signature haircut coupled with professional de-tanning pack for sun-damaged face & neck.',
    popular: true,
  },
  {
    id: 'srv-9',
    name: 'Cleanup',
    price: 300,
    duration: 45,
    active: true,
    category: 'Face & Skin',
    description: 'Complete salon facial cleanup with steam, vacuum extraction, massage and revitalizing pack.',
  },
  {
    id: 'srv-10',
    name: 'Peeling',
    price: 100,
    duration: 30,
    active: true,
    category: 'Face & Skin',
    description: 'Gentle fruit-acid peeling mask to peel away dark spots and restore natural radiance.',
  },
  {
    id: 'srv-11',
    name: 'Hair Spa',
    price: 499,
    duration: 60,
    active: true,
    category: 'Relaxation & Spa',
    description: 'Deep conditioning salon hair spa with nourishing keratin cream bath, steam and scalp therapy.',
    popular: true,
  },
  {
    id: 'srv-12',
    name: 'D-Tan',
    price: 199,
    duration: 30,
    active: true,
    category: 'Face & Skin',
    description: 'Pure organic milk & honey d-tan therapy that lightens sun tan and instantly brightens skin.',
  },
  {
    id: 'srv-13',
    name: 'Shiner',
    price: 199,
    duration: 30,
    active: true,
    category: 'Face & Skin',
    description: 'Diamond glow skin shiner serum application giving long-lasting party glow and smooth finish.',
  },
];

const DEFAULT_SETTINGS: SalonSettings = {
  name: 'VJ Salon',
  tagline: "Men's Luxury Barber & Grooming Lounge",
  address: 'Near Old Govt. Hospital, Dhamdha, Chhattisgarh, India',
  phone: '7000211850',
  additionalPhone: '7869985780',
  whatsapp: '7000211850',
  openingTime: '10:00',
  closingTime: '21:00',
  slotDuration: 30,
  googleMapsUrl: 'https://maps.google.com/?q=Near+Old+Govt.+Hospital+Dhamdha+Chhattisgarh+India',
  logoUrl: '/icon.svg',
  salonImages: [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&w=1200&q=80',
  ],
};

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// In-memory cache & Mutex
let memoryDb: DatabaseSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

// Active admin session tokens (token -> expiry timestamp)
const activeAdminTokens = new Map<string, number>();

export function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw) as DatabaseSchema;
      // Ensure defaults for missing fields if older version
      if (!memoryDb.settings) memoryDb.settings = { ...DEFAULT_SETTINGS };
      if (!memoryDb.services || memoryDb.services.length === 0) memoryDb.services = [...DEFAULT_SERVICES];
      if (!memoryDb.bookings) memoryDb.bookings = [];
      if (!memoryDb.blockedPeriods) memoryDb.blockedPeriods = [];
      if (!memoryDb.admin) {
        const salt = crypto.randomBytes(16).toString('hex');
        memoryDb.admin = {
          username: 'admin',
          salt,
          passwordHash: hashPassword('admin@vj123', salt),
        };
      }
      return memoryDb;
    } catch (err) {
      console.error('Error reading DB file, restoring defaults:', err);
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  memoryDb = {
    settings: { ...DEFAULT_SETTINGS },
    services: [...DEFAULT_SERVICES],
    bookings: [],
    blockedPeriods: [],
    admin: {
      username: 'admin',
      salt,
      passwordHash: hashPassword('admin@vj123', salt),
    },
  };

  saveDatabaseSync(memoryDb);
  return memoryDb;
}

function saveDatabaseSync(db: DatabaseSchema) {
  const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

export function getDb(): DatabaseSchema {
  if (!memoryDb) {
    return initDatabase();
  }
  return memoryDb;
}

export async function mutateDb<T>(action: (db: DatabaseSchema) => T | Promise<T>): Promise<T> {
  const currentDb = getDb();
  
  // Serialize writes through queue to eliminate race conditions
  return new Promise<T>((resolve, reject) => {
    writeQueue = writeQueue.then(async () => {
      try {
        const result = await action(currentDb);
        saveDatabaseSync(currentDb);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Authentication
export function verifyAdminLogin(username: string, pass: string): { success: boolean; token?: string; error?: string } {
  const db = getDb();
  if (username.trim().toLowerCase() !== db.admin.username.trim().toLowerCase()) {
    return { success: false, error: 'Invalid username or password' };
  }
  const computedHash = hashPassword(pass, db.admin.salt);
  if (computedHash !== db.admin.passwordHash) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Generate 30-day token
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  activeAdminTokens.set(token, expiry);

  return { success: true, token };
}

export function isTokenValid(token: string): boolean {
  if (!token) return false;
  const expiry = activeAdminTokens.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    activeAdminTokens.delete(token);
    return false;
  }
  return true;
}

export async function updateAdminCredentials(newUsername: string, newPassword?: string) {
  return mutateDb((db) => {
    if (newUsername && newUsername.trim().length >= 3) {
      db.admin.username = newUsername.trim();
    }
    if (newPassword && newPassword.trim().length >= 6) {
      const salt = crypto.randomBytes(16).toString('hex');
      db.admin.salt = salt;
      db.admin.passwordHash = hashPassword(newPassword.trim(), salt);
    }
    return { username: db.admin.username };
  });
}

// Slots calculation logic
export function parseTimeToMinutes(timeStr: string): number {
  // Handles "10:00", "14:30", "10:00 AM", "02:30 PM"
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    const isPM = clean.includes('PM');
    const part = clean.replace(/(AM|PM)/g, '').trim();
    const [hStr, mStr] = part.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h * 60 + m;
  }
  const [hStr, mStr] = clean.split(':');
  return parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10);
}

export function formatMinutesToTime(totalMins: number): { time24: string; displayTime: string } {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const h24 = String(h).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');
  const time24 = `${h24}:${mStr}`;

  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayTime = `${displayH}:${mStr} ${period}`;
  return { time24, displayTime };
}

export function getAvailableSlotsForDate(dateStr: string): { time: string; displayTime: string; available: boolean; reason?: string }[] {
  const db = getDb();
  const { openingTime, closingTime, slotDuration } = db.settings;

  const startMins = parseTimeToMinutes(openingTime);
  const endMins = parseTimeToMinutes(closingTime);
  const step = Math.max(15, slotDuration || 30);

  // Check if entire date is blocked (e.g., date matches or day of week matches like "Sunday")
  const dateObj = new Date(dateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dateObj.getDay()];

  const isFullDateBlocked = db.blockedPeriods.find(
    (b) => (b.date === dateStr || b.date.toLowerCase() === dayName.toLowerCase()) && (!b.startTime || b.startTime === 'ALL_DAY')
  );

  // Active bookings on this date (not cancelled)
  const activeBookings = db.bookings.filter(
    (b) => b.appointmentDate === dateStr && b.bookingStatus !== 'Cancelled'
  );

  // Specific time-slot blocks for this date
  const timeBlocks = db.blockedPeriods.filter(
    (b) => (b.date === dateStr || b.date.toLowerCase() === dayName.toLowerCase()) && b.startTime && b.startTime !== 'ALL_DAY'
  );

  const slots: { time: string; displayTime: string; available: boolean; reason?: string }[] = [];

  for (let m = startMins; m + step <= endMins; m += step) {
    const { time24, displayTime } = formatMinutesToTime(m);

    if (isFullDateBlocked) {
      slots.push({
        time: time24,
        displayTime,
        available: false,
        reason: isFullDateBlocked.reason || 'Salon closed on this date',
      });
      continue;
    }

    // Check if within any timeBlock
    const matchingBlock = timeBlocks.find((tb) => {
      const bStart = parseTimeToMinutes(tb.startTime!);
      const bEnd = tb.endTime ? parseTimeToMinutes(tb.endTime) : bStart + step;
      return m >= bStart && m < bEnd;
    });

    if (matchingBlock) {
      slots.push({
        time: time24,
        displayTime,
        available: false,
        reason: matchingBlock.reason || 'Slot blocked by admin',
      });
      continue;
    }

    // Check if already booked
    const isBooked = activeBookings.some((b) => {
      const bookedStart = parseTimeToMinutes(b.appointmentTime);
      const bookedEnd = bookedStart + (b.totalDuration || step);
      // Overlaps if slot starts before bookedEnd and ends after bookedStart
      return m < bookedEnd && m + step > bookedStart;
    });

    if (isBooked) {
      slots.push({
        time: time24,
        displayTime,
        available: false,
        reason: 'Already booked',
      });
    } else {
      slots.push({
        time: time24,
        displayTime,
        available: true,
      });
    }
  }

  return slots;
}

export function generateBookingId(): string {
  const today = new Date();
  const yr = String(today.getFullYear()).slice(-2);
  const mo = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `VJ-${yr}${mo}${day}-${rand}`;
}

export function calculateDashboardStats(): DashboardStats {
  const db = getDb();
  const todayStr = new Date().toISOString().split('T')[0];

  let todayAppointmentsCount = 0;
  let upcomingAppointmentsCount = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;
  let todayEstimatedRevenue = 0;
  let totalRevenue = 0;

  for (const b of db.bookings) {
    if (b.bookingStatus === 'Pending') pendingCount++;
    if (b.bookingStatus === 'Confirmed') confirmedCount++;
    if (b.bookingStatus === 'Completed') completedCount++;
    if (b.bookingStatus === 'Cancelled') cancelledCount++;
    if (b.bookingStatus === 'No Show') noShowCount++;

    if (b.appointmentDate === todayStr && b.bookingStatus !== 'Cancelled') {
      todayAppointmentsCount++;
      todayEstimatedRevenue += b.totalAmount || 0;
    }

    if (b.appointmentDate > todayStr && b.bookingStatus !== 'Cancelled') {
      upcomingAppointmentsCount++;
    }

    if (b.bookingStatus === 'Completed' || (b.bookingStatus === 'Confirmed' && b.appointmentDate <= todayStr)) {
      totalRevenue += b.totalAmount || 0;
    }
  }

  return {
    todayAppointmentsCount,
    upcomingAppointmentsCount,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    noShowCount,
    totalBookingsCount: db.bookings.length,
    todayEstimatedRevenue,
    totalRevenue,
  };
}
