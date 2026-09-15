import React from 'react';
import { Phone, MessageCircle, Calendar, Shield, Scissors } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import type { SalonSettings } from '../types';

interface NavbarProps {
  settings: SalonSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0d11]/95 backdrop-blur-md border-b border-[#c69214]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            id="nav-brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-[#c69214]/60 p-1.5 flex items-center justify-center shadow-md group-hover:border-[#f3cc51] transition">
              <img
                src="/icon.svg"
                alt="VJ Salon Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-luxury text-xl font-extrabold tracking-wider text-white group-hover:text-[#f3cc51] transition">
                  VJ SALON
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#c69214]/20 text-[#f3cc51] border border-[#c69214]/30">
                  Men's
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium tracking-wide">
                Dhamdha, Chhattisgarh
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-link-home"
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'home'
                  ? 'text-[#f3cc51] bg-[#c69214]/15 font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              Home
            </button>
            <button
              id="nav-link-services"
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'services'
                  ? 'text-[#f3cc51] bg-[#c69214]/15 font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              Services
            </button>
            <button
              id="nav-link-my-bookings"
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'my-bookings'
                  ? 'text-[#f3cc51] bg-[#c69214]/15 font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              My Bookings
            </button>
            <button
              id="nav-link-contact"
              onClick={() => setActiveTab('contact')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'contact'
                  ? 'text-[#f3cc51] bg-[#c69214]/15 font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              Contact & Map
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton variant="button" />

            {/* WhatsApp Quick Link */}
            <a
              id="btn-nav-whatsapp"
              href={`https://wa.me/91${settings.whatsapp}?text=Hello%20VJ%20Salon,%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Direct Call Button */}
            <a
              id="btn-nav-call"
              href={`tel:${settings.phone}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800/80 border border-neutral-700 text-neutral-200 hover:bg-neutral-700 transition"
              title="Call Salon"
            >
              <Phone className="w-3.5 h-3.5 text-[#f3cc51]" />
              <span>{settings.phone}</span>
            </a>

            {/* Book Appointment CTA */}
            <button
              id="btn-nav-book-now"
              onClick={onOpenBooking}
              className="gold-button px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Book Appointment</span>
              <span className="xs:hidden">Book</span>
            </button>

            {/* Admin Dashboard Trigger */}
            <button
              id="btn-nav-admin"
              onClick={onOpenAdmin}
              className={`p-2 rounded-xl border text-xs font-medium transition flex items-center justify-center ${
                isAdminLoggedIn
                  ? 'bg-[#c69214]/20 border-[#c69214] text-[#f3cc51]'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
