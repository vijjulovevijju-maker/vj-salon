import type {
  Booking,
  ServiceItem,
  SalonSettings,
  BlockedPeriod,
  SlotAvailability,
  DashboardStats,
  BookingStatus,
} from './types';

const ADMIN_TOKEN_KEY = 'vj_admin_token';

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// CUSTOMER APIS
// ==========================================

export async function fetchSalonInfo(): Promise<SalonSettings> {
  const res = await fetch('/api/salon/info');
  if (!res.ok) throw new Error('Failed to load salon information');
  return res.json();
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function fetchAvailableSlots(date: string): Promise<{ date: string; slots: SlotAvailability[] }> {
  const res = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error('Failed to load available slots');
  return res.json();
}

export interface CreateBookingPayload {
  customerName: string;
  mobileNumber: string;
  serviceIds: string[];
  appointmentDate: string;
  appointmentTime: string;
  customerMessage?: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<{ success: boolean; booking: Booking; salon: SalonSettings }> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to confirm booking');
  }
  return data;
}

export async function lookupMyBookings(mobile?: string, bookingId?: string): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (mobile) params.append('mobile', mobile);
  if (bookingId) params.append('bookingId', bookingId);

  const res = await fetch(`/api/my-bookings?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to find bookings');
  }
  const data = await res.json();
  return data.bookings || [];
}

// ==========================================
// ADMIN APIS
// ==========================================

export async function adminLogin(username: string, pass: string): Promise<{ success: boolean; token: string; username: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: pass }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid username or password');
  }
  setStoredAdminToken(data.token);
  return data;
}

export async function adminVerify(): Promise<{ success: boolean; username: string }> {
  const res = await fetch('/api/admin/verify', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    setStoredAdminToken(null);
    throw new Error('Unauthorized');
  }
  return res.json();
}

export async function adminChangeCredentials(newUsername: string, newPassword?: string): Promise<{ success: boolean; username: string }> {
  const res = await fetch('/api/admin/change-credentials', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newUsername, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update credentials');
  return data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/admin/dashboard-stats', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchAdminBookings(filters?: { search?: string; date?: string; status?: string }): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.date) params.append('date', filters.date);
  if (filters?.status) params.append('status', filters.status);

  const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
  const res = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update booking status');
  return data.booking;
}

export async function createWalkInBooking(payload: CreateBookingPayload): Promise<Booking> {
  const res = await fetch('/api/admin/walkin-booking', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create walk-in booking');
  return data.booking;
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const res = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete booking');
}

export async function fetchAdminServices(): Promise<ServiceItem[]> {
  const res = await fetch('/api/admin/services', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export async function addAdminService(service: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await fetch('/api/admin/services', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(service),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add service');
  return data.service;
}

export async function updateAdminService(id: string, service: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await fetch(`/api/admin/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(service),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update service');
  return data.service;
}

export async function deleteAdminService(id: string): Promise<void> {
  const res = await fetch(`/api/admin/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

export async function fetchAdminSettings(): Promise<{ settings: SalonSettings; blockedPeriods: BlockedPeriod[] }> {
  const res = await fetch('/api/admin/settings', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateAdminSettings(settings: Partial<SalonSettings>): Promise<SalonSettings> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update salon settings');
  return data.settings;
}

export async function addBlockedPeriod(block: { date: string; startTime?: string; endTime?: string; reason?: string }): Promise<BlockedPeriod> {
  const res = await fetch('/api/admin/blocked-periods', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(block),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to block time period');
  return data.blockedPeriod;
}

export async function deleteBlockedPeriod(id: string): Promise<void> {
  const res = await fetch(`/api/admin/blocked-periods/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove block');
}
