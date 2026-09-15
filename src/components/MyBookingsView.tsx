import React, { useState } from 'react';
import { Search, Phone, Calendar, Clock, Scissors, MessageCircle, AlertCircle, BookmarkCheck, ChevronRight } from 'lucide-react';
import type { Booking, SalonSettings } from '../types';
import { lookupMyBookings } from '../api';

interface MyBookingsViewProps {
  settings: SalonSettings;
  onBookNew: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ settings, onBookNew }) => {
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() && !bookingId.trim()) {
      setError('Please enter your 10-digit mobile number or your Booking ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await lookupMyBookings(mobileNumber.trim(), bookingId.trim());
      setBookings(results);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to find bookings.');
      setBookings([]);
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40';
      case 'Pending':
        return 'bg-amber-950/80 text-amber-400 border border-amber-500/40';
      case 'Completed':
        return 'bg-blue-950/80 text-blue-400 border border-blue-500/40';
      case 'Cancelled':
        return 'bg-red-950/80 text-red-400 border border-red-500/40';
      case 'No Show':
        return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
      default:
        return 'bg-neutral-800 text-neutral-300';
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#c69214]/20 border border-[#c69214]/40 text-[#f3cc51] flex items-center justify-center mx-auto mb-3">
          <BookmarkCheck className="w-6 h-6" />
        </div>
        <h2 className="font-serif-luxury text-3xl font-bold text-white">
          My Appointments & Status
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2">
          Enter your registered mobile number or Booking ID to check your appointment schedule.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="rounded-3xl bg-neutral-900 border border-[#c69214]/30 p-6 sm:p-8 shadow-2xl mb-10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  id="input-lookup-mobile"
                  type="tel"
                  placeholder="e.g. 7000211850"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-3 text-base sm:text-sm text-white outline-none pl-10"
                />
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Booking ID (Optional)
              </label>
              <div className="relative">
                <input
                  id="input-lookup-booking-id"
                  type="text"
                  placeholder="e.g. VJ-260914-XXXX"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-3 text-base sm:text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-search-my-bookings"
              type="submit"
              disabled={isLoading}
              className="gold-button px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Find Appointments</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBookNew}
              className="text-xs text-[#f3cc51] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Book New Slot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-300 flex items-center justify-between">
            <span>Found Appointments ({bookings?.length || 0})</span>
            {bookings && bookings.length > 0 && (
              <span className="text-xs text-[#f3cc51] font-semibold">Latest first</span>
            )}
          </h3>

          {!bookings || bookings.length === 0 ? (
            <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800 p-8 text-center text-neutral-400">
              <p className="text-sm font-semibold text-white">No appointments found</p>
              <p className="text-xs mt-1">
                Please verify the mobile number or booking ID, or schedule a fresh appointment.
              </p>
              <button
                onClick={onBookNew}
                className="mt-4 gold-button px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>Book Appointment Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isUpcoming = booking.appointmentDate >= new Date().toISOString().split('T')[0] && booking.bookingStatus !== 'Cancelled';

                return (
                  <div
                    key={booking.id}
                    className={`rounded-2xl p-5 border transition ${
                      isUpcoming
                        ? 'bg-neutral-900 border-[#c69214]/50 shadow-xl'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#f3cc51] bg-neutral-800 px-2 py-0.5 rounded">
                          {booking.id}
                        </span>
                        {isUpcoming && (
                          <span className="text-[10px] font-bold bg-[#c69214]/20 text-[#f3cc51] px-2 py-0.5 rounded border border-[#c69214]/40">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadge(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 text-xs">
                      <div>
                        <span className="text-neutral-400 block text-[11px]">Appointment Date & Time</span>
                        <p className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#f3cc51]" />
                          {booking.appointmentDate} at {booking.appointmentTime}
                        </p>
                      </div>

                      <div>
                        <span className="text-neutral-400 block text-[11px]">Selected Services</span>
                        <p className="font-bold text-white mt-0.5">
                          {booking.selectedServices.map((s) => s.name).join(', ')}
                        </p>
                      </div>

                      <div>
                        <span className="text-neutral-400 block text-[11px]">Total Amount</span>
                        <p className="font-extrabold text-[#f3cc51] text-sm mt-0.5">
                          ₹{booking.totalAmount}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-neutral-400">
                        Customer: <strong className="text-neutral-200">{booking.customerName}</strong> ({booking.mobileNumber})
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${settings.whatsapp}?text=${encodeURIComponent(
                            `Hello VJ Salon, I am asking about my Booking ID: ${booking.id} (${booking.customerName}) scheduled for ${booking.appointmentDate} at ${booking.appointmentTime}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 font-medium flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Salon</span>
                        </a>

                        <a
                          href={`tel:${settings.phone}`}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-medium flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#f3cc51]" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
