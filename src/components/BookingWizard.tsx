import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Scissors,
  Check,
} from 'lucide-react';
import type { ServiceItem, SlotAvailability, Booking, SalonSettings } from '../types';
import { fetchAvailableSlots, createBooking } from '../api';

interface BookingWizardProps {
  services: ServiceItem[];
  settings: SalonSettings;
  preSelectedServiceIds?: string[];
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  settings,
  preSelectedServiceIds = [],
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  // Steps: 1 = Services, 2 = Date, 3 = Time Slot, 4 = Customer Details, 5 = Review & Confirm, 6 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);

  // Customer Info
  const [customerName, setCustomerName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Local date helper to avoid UTC discrepancies on mobile in India
  const getLocalDateStr = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize today's date formatted as YYYY-MM-DD
  const todayStr = getLocalDateStr(new Date());

  // Pre-fill date and pre-selected services when opening
  useEffect(() => {
    if (isOpen) {
      if (preSelectedServiceIds.length > 0) {
        setSelectedServiceIds(preSelectedServiceIds);
      } else if (selectedServiceIds.length === 0 && services.length > 0) {
        // Default select first popular service
        const defaultService = services.find((s) => s.popular) || services[0];
        if (defaultService) setSelectedServiceIds([defaultService.id]);
      }
      if (!selectedDate) {
        setSelectedDate(todayStr);
      }
    }
  }, [isOpen, preSelectedServiceIds, services]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    let isMounted = true;
    setLoadingSlots(true);
    setSlotsError(null);

    fetchAvailableSlots(selectedDate)
      .then((data) => {
        if (isMounted) {
          setAvailableSlots(data.slots);
          // If currently selected slot is no longer available on this date, reset it
          if (selectedSlot) {
            const found = data.slots.find((s) => s.time === selectedSlot.time && s.available);
            if (!found) setSelectedSlot(null);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setSlotsError('Could not load slots for this date. Please try another day.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  if (!isOpen) return null;

  // Derived calculations
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // Service toggling
  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Next / Prev step navigation with validation
  const handleNext = () => {
    setValidationError(null);
    setErrorMessage(null);

    if (currentStep === 1) {
      if (selectedServiceIds.length === 0) {
        setValidationError('Please select at least one service to proceed.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate) {
        setValidationError('Please select an appointment date.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedSlot) {
        setValidationError('Please select an available time slot.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!customerName.trim() || customerName.trim().length < 2) {
        setValidationError('Please enter your full name (minimum 2 characters).');
        return;
      }
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        setValidationError('Please enter a valid 10-digit mobile number.');
        return;
      }
      setCurrentStep(5); // Review & Confirm
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setErrorMessage(null);
    if (currentStep > 1 && currentStep <= 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await createBooking({
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        serviceIds: selectedServiceIds,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.time,
        customerMessage: customerMessage.trim(),
      });

      setConfirmedBooking(response.booking);
      setCurrentStep(6); // Success Step
      if (onBookingSuccess) {
        onBookingSuccess(response.booking);
      }
    } catch (err: any) {
      // Handles the exact double-booking message requested:
      // "Sorry, this time slot is no longer available. Please select another time."
      setErrorMessage(
        err.message || 'Sorry, this time slot is no longer available. Please select another time.'
      );
      // Re-fetch slots to reflect newly booked time
      fetchAvailableSlots(selectedDate).then((data) => setAvailableSlots(data.slots));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset booking wizard for "Book Another Appointment"
  const handleBookAnother = () => {
    setConfirmedBooking(null);
    setSelectedSlot(null);
    setCustomerMessage('');
    setCurrentStep(1);
  };

  // Format date for readable display (e.g., "Monday, 15 Sep 2026")
  const formatReadableDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // WhatsApp Pre-filled message link generator
  const getWhatsAppBookingLink = () => {
    if (!confirmedBooking) return '#';
    const servicesText = confirmedBooking.selectedServices.map((s) => s.name).join(', ');
    const msg = `Hello VJ Salon, I have booked an appointment.\n\nBooking ID: ${confirmedBooking.id}\nName: ${confirmedBooking.customerName}\nService: ${servicesText}\nDate: ${confirmedBooking.appointmentDate}\nTime: ${confirmedBooking.appointmentTime}\nTotal Amount: ₹${confirmedBooking.totalAmount}\n\nThank you.`;
    return `https://wa.me/91${settings.whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-neutral-900 border-t sm:border border-[#c69214]/50 shadow-2xl text-neutral-100 overflow-hidden h-[95vh] sm:h-auto sm:max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-black/70 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c69214]/20 border border-[#c69214]/40 flex items-center justify-center text-[#f3cc51]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-base sm:text-lg font-bold text-white leading-tight">
                {currentStep === 6 ? 'Booking Confirmed!' : 'Book Your Appointment'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                VJ Salon • Near Old Govt. Hospital, Dhamdha
              </p>
            </div>
          </div>
          <button
            id="btn-close-booking-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker (Steps 1 to 5) */}
        {currentStep <= 5 && (
          <div className="px-5 sm:px-6 pt-3 pb-2 bg-neutral-950/40 border-b border-neutral-800/80 shrink-0">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold mb-2 text-neutral-400">
              <span className={currentStep === 1 ? 'text-[#f3cc51]' : currentStep > 1 ? 'text-neutral-200' : ''}>1. Services</span>
              <span className={currentStep === 2 ? 'text-[#f3cc51]' : currentStep > 2 ? 'text-neutral-200' : ''}>2. Date</span>
              <span className={currentStep === 3 ? 'text-[#f3cc51]' : currentStep > 3 ? 'text-neutral-200' : ''}>3. Slot</span>
              <span className={currentStep === 4 ? 'text-[#f3cc51]' : currentStep > 4 ? 'text-neutral-200' : ''}>4. Details</span>
              <span className={currentStep === 5 ? 'text-[#f3cc51]' : ''}>5. Confirm</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#C69214] to-[#F3CC51] h-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          
          {/* Validation or Error Message */}
          {(validationError || errorMessage) && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{validationError || errorMessage}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: SELECT SERVICE (MULTIPLE ALLOWED) */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center justify-between">
                  <span>Select Grooming Services</span>
                  <span className="text-xs font-semibold text-[#f3cc51] bg-[#c69214]/15 px-2.5 py-1 rounded-full border border-[#c69214]/30">
                    Multiple allowed
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pick one or more services. Total price updates automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {services.map((service) => {
                  const isChecked = selectedServiceIds.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-[#c69214]/15 border-[#f3cc51] text-white'
                          : 'bg-neutral-800/60 border-neutral-700/80 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition ${
                            isChecked
                              ? 'bg-[#f3cc51] text-black'
                              : 'border border-neutral-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {service.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            ~{service.duration} mins
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-[#f3cc51]">
                          ₹{service.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Selected Total Price Footer */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-neutral-400">Total Services:</span>
                  <span className="font-bold text-white ml-1.5">{selectedServices.length}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400">Total Amount:</span>
                  <span className="text-lg font-black text-[#f3cc51] ml-2">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: SELECT APPOINTMENT DATE */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Select Appointment Date</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Choose a date to check available slots at VJ Salon.
                </p>
              </div>

              {/* Quick Preset Buttons (Today, Tomorrow, Day After) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[0, 1, 2].map((offset) => {
                  const target = new Date();
                  target.setDate(target.getDate() + offset);
                  const iso = getLocalDateStr(target);
                  const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : target.toLocaleDateString('en-IN', { weekday: 'short' });
                  const isChosen = selectedDate === iso;

                  return (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => setSelectedDate(iso)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-center transition ${
                        isChosen
                          ? 'bg-[#c69214]/20 border-[#f3cc51] text-white shadow-md'
                          : 'bg-neutral-800/70 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <p className="text-[11px] sm:text-xs font-semibold text-[#f3cc51]">{label}</p>
                      <p className="text-xs sm:text-sm font-bold mt-0.5">
                        {target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Calendar Date Input */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Or pick a specific future date:
                </label>
                <div className="relative">
                  <input
                    id="input-booking-date"
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-3 text-sm text-white outline-none"
                  />
                  <Calendar className="w-4 h-4 text-neutral-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {selectedDate && (
                <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Selected Appointment Date:</span>
                  <span className="font-bold text-[#f3cc51]">{formatReadableDate(selectedDate)}</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: AVAILABLE TIME SLOTS */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Select Time Slot</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    For {formatReadableDate(selectedDate)} (Salon Hours: 10:00 AM – 9:00 PM)
                  </p>
                </div>
                <div className="text-xs text-[#f3cc51] font-semibold bg-[#c69214]/15 px-2.5 py-1 rounded-lg border border-[#c69214]/30">
                  30 min slots
                </div>
              </div>

              {loadingSlots ? (
                <div className="py-12 text-center text-neutral-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-[#f3cc51] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Checking live salon availability...</p>
                </div>
              ) : slotsError ? (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                  {slotsError}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 bg-neutral-800/40 rounded-2xl border border-neutral-800 p-4">
                  <p className="text-sm font-semibold text-neutral-300">No slots available for this date</p>
                  <p className="text-xs mt-1">Please select another date above.</p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-3 text-xs text-[#f3cc51] underline font-bold"
                  >
                    Change Date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        id={`slot-btn-${slot.time.replace(':', '-')}`}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-center border transition relative flex flex-col items-center justify-center ${
                          !slot.available
                            ? 'bg-neutral-900/50 border-neutral-800/80 text-neutral-500 opacity-50 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#c69214] text-black border-[#f3cc51] font-bold shadow-lg shadow-[#c69214]/25 scale-102'
                            : 'bg-neutral-800/80 border-neutral-700 text-neutral-200 hover:border-[#f3cc51]/50 hover:bg-neutral-800'
                        }`}
                        title={slot.available ? 'Available' : slot.reason || 'Slot unavailable'}
                      >
                        <span className="text-xs font-semibold leading-tight">{slot.displayTime}</span>
                        {!slot.available && (
                          <span className="text-[9px] text-red-400 font-medium no-underline mt-0.5">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedSlot && (
                <div className="p-3 rounded-xl bg-[#c69214]/15 border border-[#c69214]/40 flex items-center justify-between text-xs text-white">
                  <span className="text-neutral-300">Selected Time Slot:</span>
                  <span className="font-extrabold text-[#f3cc51] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedSlot.displayTime}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: CUSTOMER DETAILS */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Your Contact Details</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  We'll send your appointment confirmation & Booking ID via WhatsApp.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full Name <span className="text-[#f3cc51]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-customer-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-3 text-base sm:text-sm text-white outline-none pl-10"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Mobile Number (10 Digits) <span className="text-[#f3cc51]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 flex items-center gap-1 text-neutral-400 text-xs font-semibold border-r border-neutral-700 pr-2">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    id="input-customer-mobile"
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="7000211850"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-3 text-base sm:text-sm text-white outline-none pl-[82px]"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Valid 10-digit Indian mobile number.
                </p>
              </div>

              {/* Optional message */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Optional Note / Preferences
                </label>
                <textarea
                  id="input-customer-message"
                  rows={2}
                  placeholder="e.g. Skin fade with razor detailing, low trim..."
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: REVIEW & FINAL CONFIRMATION CARD */}
          {/* ========================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Review Appointment Details</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Please verify your booking details before confirming.
                </p>
              </div>

              <div className="rounded-2xl bg-black/60 border border-[#c69214]/40 p-4 sm:p-5 space-y-3.5">
                {/* Services summary */}
                <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-medium">
                      Selected Services ({selectedServices.length})
                    </span>
                    <div className="mt-1 space-y-1">
                      {selectedServices.map((s) => (
                        <div key={s.id} className="text-xs text-neutral-200 flex items-center justify-between gap-4">
                          <span>{s.name} (~{s.duration} min)</span>
                          <span className="font-bold text-white">₹{s.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-800 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-medium">
                      Date
                    </span>
                    <span className="font-bold text-white mt-0.5 block">
                      {formatReadableDate(selectedDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-medium">
                      Time Slot
                    </span>
                    <span className="font-bold text-[#f3cc51] mt-0.5 block">
                      {selectedSlot?.displayTime}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-800 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-medium">
                      Customer Name
                    </span>
                    <span className="font-bold text-white mt-0.5 block">
                      {customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-medium">
                      Mobile Number
                    </span>
                    <span className="font-bold text-white mt-0.5 block">
                      +91 {mobileNumber}
                    </span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-neutral-400">Total Payable at Salon:</span>
                    <p className="text-[11px] text-emerald-400">Pay after your service (Cash/UPI)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#f3cc51]">₹{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 6: BOOKING CONFIRMATION SUCCESS SCREEN */}
          {/* ========================================================= */}
          {currentStep === 6 && confirmedBooking && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="font-serif-luxury text-2xl font-extrabold text-white">
                  Appointment Booked Successfully
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Your seat is reserved at VJ Salon, Dhamdha!
                </p>
              </div>

              {/* Booking Card Details */}
              <div className="rounded-2xl bg-neutral-950/90 border border-[#c69214]/50 p-5 text-left text-xs space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="text-neutral-400 font-medium">Booking ID</span>
                  <span className="font-mono font-extrabold text-[#f3cc51] text-sm bg-neutral-900 px-2.5 py-1 rounded-lg border border-[#c69214]/40">
                    {confirmedBooking.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Customer Name</span>
                  <span className="font-bold text-white">{confirmedBooking.customerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Service</span>
                  <span className="font-bold text-white text-right max-w-[200px] truncate">
                    {confirmedBooking.selectedServices.map((s) => s.name).join(', ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Date</span>
                  <span className="font-bold text-white">{formatReadableDate(confirmedBooking.appointmentDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Time</span>
                  <span className="font-bold text-[#f3cc51]">{confirmedBooking.appointmentTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Total Amount</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₹{confirmedBooking.totalAmount}</span>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{settings.name}</span>
                  <span>{settings.phone}</span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp, Call, Book Another */}
              <div className="space-y-2.5 pt-2">
                
                {/* WhatsApp Salon Button with pre-filled message */}
                <a
                  id="btn-confirm-whatsapp"
                  href={getWhatsAppBookingLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Send Confirmation on WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Call Salon Button */}
                  <a
                    id="btn-confirm-call"
                    href={`tel:${settings.phone}`}
                    className="py-3 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#f3cc51]" />
                    <span>Call Salon</span>
                  </a>

                  {/* Book Another Appointment */}
                  <button
                    id="btn-confirm-book-another"
                    onClick={handleBookAnother}
                    className="py-3 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[#f3cc51] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#c69214]/40 transition"
                  >
                    <span>Book Another</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation (Next, Back, Confirm) */}
        {currentStep <= 5 && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-neutral-950/95 border-t border-neutral-800 flex items-center justify-between shrink-0 safe-area-bottom">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                id="btn-wizard-next"
                type="button"
                onClick={handleNext}
                className="gold-button px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-confirm-appointment"
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="gold-button px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Confirm Appointment</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
