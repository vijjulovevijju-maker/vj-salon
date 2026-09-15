import React from 'react';
import {
  Calendar,
  Scissors,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Navigation,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';
import type { SalonSettings, ServiceItem } from '../types';

interface HeroSectionProps {
  settings: SalonSettings;
  services: ServiceItem[];
  onBookAppointment: () => void;
  onExploreServices: () => void;
  onSelectServiceToBook: (serviceId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  services,
  onBookAppointment,
  onExploreServices,
  onSelectServiceToBook,
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Gold Ambient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[25%] w-[450px] h-[450px] bg-[#c69214]/15 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-[#f5c542]/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Hero Header */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c69214]/15 border border-[#c69214]/40 text-[#f3cc51] text-xs font-semibold mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE PREMIUM MEN'S GROOMING LOUNGE</span>
            </div>

            {/* Huge VJ SALON Branding */}
            <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none mb-3">
              <span className="block text-neutral-300 text-2xl sm:text-3xl font-light tracking-widest mb-1">
                WELCOME TO
              </span>
              <span className="gold-gradient-text drop-shadow-sm">
                VJ SALON
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 font-medium max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Experience master haircutting, beard sculpting, facial scrubs, and luxury hair spa tailored specifically for men in Dhamdha.
            </p>

            {/* Key Quick Info Pills (Address & Hours) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-[#f3cc51] shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-[#f3cc51] shrink-0" />
                <span>Open Daily: 10:00 AM – 9:00 PM</span>
              </div>
            </div>

            {/* Primary Action Buttons (Responsive on Mobile & Desktop) */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 mb-8 max-w-xl mx-auto lg:mx-0">
              {/* "Book Appointment" - Full width on mobile, prominent gold */}
              <button
                id="btn-hero-book-appointment"
                onClick={onBookAppointment}
                className="gold-button w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-[#c69214]/20 text-center"
              >
                <Calendar className="w-5 h-5 text-black stroke-[2.5]" />
                <span>Book Appointment</span>
              </button>

              {/* Mobile 2x2 grid for quick actions / Flex row on desktop */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                {/* "WhatsApp" */}
                <a
                  id="btn-hero-whatsapp"
                  href={`https://wa.me/91${settings.whatsapp}?text=Hello%20VJ%20Salon,%20I%20want%20to%20inquire%20about%20an%20appointment.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/50 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition text-center"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp</span>
                </a>

                {/* "Call Now" */}
                <a
                  id="btn-hero-call-now"
                  href={`tel:${settings.phone}`}
                  className="bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition text-center"
                >
                  <Phone className="w-4 h-4 text-[#f3cc51] shrink-0" />
                  <span>Call Now</span>
                </a>

                {/* "Our Services" */}
                <button
                  id="btn-hero-our-services"
                  onClick={onExploreServices}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-[#f3cc51]/50 px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition text-center"
                >
                  <Scissors className="w-4 h-4 text-[#f3cc51] shrink-0" />
                  <span>Our Services</span>
                </button>

                {/* Google Maps / Get Directions */}
                <a
                  id="btn-hero-directions"
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-[#c69214]/50 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition text-center"
                >
                  <Navigation className="w-4 h-4 text-[#f3cc51] shrink-0" />
                  <span>Directions</span>
                </a>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#f3cc51]" />
                <span>Instant Slot Confirmation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#f3cc51]" />
                <span>Zero Double Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#f3cc51]" />
                <span>WhatsApp Alerts</span>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Cards & Visuals */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Gold Frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#c69214] via-[#f3cc51] to-neutral-800 rounded-3xl blur-sm opacity-40" />

              {/* Main Banner Card */}
              <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-[#c69214]/40 shadow-2xl">
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80"
                    alt="VJ Salon Master Barber Styling Hair"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-black/30" />
                  
                  {/* Floating Price Tag badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-black/85 backdrop-blur-md border border-[#c69214]/40">
                    <div>
                      <p className="text-[11px] text-[#f3cc51] font-bold uppercase tracking-wider">Most Popular Combo</p>
                      <h4 className="text-sm font-bold text-white">Haircut + Beard Trim</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#f3cc51]">₹100</span>
                      <p className="text-[10px] text-neutral-400">45 mins</p>
                    </div>
                  </div>
                </div>

                {/* Additional Quick Highlights below image */}
                <div className="p-4 bg-neutral-950/90 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <p className="text-lg font-black text-white">₹60</p>
                    <p className="text-[10px] text-neutral-400">Haircut</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <p className="text-lg font-black text-white">₹50</p>
                    <p className="text-[10px] text-neutral-400">Beard Set</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <p className="text-lg font-black text-white">₹499</p>
                    <p className="text-[10px] text-neutral-400">Hair Spa</p>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-5 -left-4 hidden sm:flex items-center gap-3 bg-neutral-900/95 border border-[#c69214]/50 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-[#c69214]/20 flex items-center justify-center text-[#f3cc51]">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#f3cc51]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#f3cc51]" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-white">Dhamdha's Top Men's Salon</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Haircuts & Barber Gallery Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#f3cc51] uppercase tracking-widest">
              GALLERY & TRENDS
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
              Master Craftsmanship & Haircuts
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg">
              Check out our signature fades, beard shaping, facial d-tan and premium styling services.
            </p>
          </div>
          <button
            onClick={onExploreServices}
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#f3cc51] hover:underline"
          >
            <span>View All 13 Services & Prices</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* 4 Professional Men's Salon Images */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[#c69214]/50 transition shadow-lg">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80"
                alt="Sharp Fade Haircut VJ Salon"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-bold text-white">Classic & Modern Fade</p>
                <p className="text-[11px] text-[#f3cc51] font-semibold">₹60 • 30 mins</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[#c69214]/50 transition shadow-lg">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80"
                alt="Beard Trimming & Shaping VJ Salon"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-bold text-white">Beard Sculpt & Set</p>
                <p className="text-[11px] text-[#f3cc51] font-semibold">₹50 • 20 mins</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[#c69214]/50 transition shadow-lg">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&w=600&q=80"
                alt="Facial Scrub & Cleanup VJ Salon"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-bold text-white">Scrub & D-Tan Glow</p>
                <p className="text-[11px] text-[#f3cc51] font-semibold">From ₹50</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[#c69214]/50 transition shadow-lg">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Hair Spa VJ Salon"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-bold text-white">Keratin Hair Spa</p>
                <p className="text-[11px] text-[#f3cc51] font-semibold">₹499 • 60 mins</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
