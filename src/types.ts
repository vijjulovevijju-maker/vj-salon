export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  active: boolean;
  category: string;
  description?: string;
  popular?: boolean;
}

export interface SelectedServiceSummary {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: string;
  customerName: string;
  mobileNumber: string;
  selectedServices: SelectedServiceSummary[];
  totalAmount: number;
  totalDuration: number;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // "10:00 AM" or "14:30"
  bookingStatus: BookingStatus;
  customerMessage?: string;
  createdDateTime: string;
  isWalkIn?: boolean;
}

export interface BlockedPeriod {
  id: string;
  date: string; // YYYY-MM-DD or day name like "Sunday"
  startTime?: string; // e.g. "14:00" or empty for full day
  endTime?: string; // e.g. "16:00"
  reason: string;
}

export interface SalonSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  additionalPhone: string;
  whatsapp: string;
  openingTime: string; // "10:00" (24hr)
  closingTime: string; // "21:00" (24hr)
  slotDuration: number; // 30, 45, 60 minutes
  googleMapsUrl: string;
  logoUrl: string;
  salonImages: string[];
}

export interface SlotAvailability {
  time: string; // 24hr "10:00"
  displayTime: string; // "10:00 AM"
  available: boolean;
  reason?: string;
}

export interface DashboardStats {
  todayAppointmentsCount: number;
  upcomingAppointmentsCount: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  totalBookingsCount: number;
  todayEstimatedRevenue: number;
  totalRevenue: number;
}
