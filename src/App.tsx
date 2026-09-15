import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { MyBookingsView } from './components/MyBookingsView';
import { BookingWizard } from './components/BookingWizard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  fetchSalonInfo,
  fetchServices,
  getStoredAdminToken,
} from './api';
import type { SalonSettings, ServiceItem, Booking } from './types';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Navigation,
  Shield,
  Heart,
  Calendar,
  Sparkles,
} from 'lucide-react';

// Fallback data if server connection is delayed or offline
const FALLBACK_SETTINGS: SalonSettings = {
  name: 'VJ Salon',
  tagline: "Dhamdha's Premier Men's Salon & Grooming Lounge",
  address: 'Near Old Govt. Hospital, Dhamdha, Chhattisgarh, India',
  phone: '7000211850',
  additionalPhone: '7869985780',
  whatsapp: '7000211850',
  openingTime: '10:00',
  closingTime: '21:00',
  slotDuration: 30,
  googleMapsUrl: 'https://maps.google.com/?q=Dhamdha+Chhattisgarh+India',
  logoUrl: '/icon.svg',
  salonImages: [],
};

const FALLBACK_SERVICES: ServiceItem[] = [
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

export default function App() {
  const [settings, setSettings] = useState<SalonSettings>(FALLBACK_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preSelectedServices, setPreSelectedServices] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Load salon configuration and services
  const loadInitialData = async () => {
    try {
      const [salonData, servicesData] = await Promise.all([
        fetchSalonInfo().catch(() => FALLBACK_SETTINGS),
        fetchServices().catch(() => FALLBACK_SERVICES),
      ]);
      setSettings(salonData || FALLBACK_SETTINGS);
      if (servicesData && servicesData.length > 0) {
        setServices(servicesData);
      }
    } catch (err) {
      console.warn('Using offline fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    setIsAdminLoggedIn(!!getStoredAdminToken());
  }, []);

  // Multi-service selection toggling on main services section
  const handleToggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Open booking with multiple selected items
  const handleBookSelectedServices = () => {
    setPreSelectedServices(selectedServiceIds);
    setIsBookingOpen(true);
  };

  // Open booking for single service click
  const handleBookSingleService = (id: string) => {
    setPreSelectedServices([id]);
    setIsBookingOpen(true);
  };

  // General "Book Appointment" click
  const handleOpenGeneralBooking = () => {
    setPreSelectedServices(selectedServiceIds.length > 0 ? selectedServiceIds : []);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col selection:bg-[#c69214]/30 selection:text-[#f3cc51]">
      <OfflineIndicator />

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={handleOpenGeneralBooking}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* PWA Mobile App Install Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-3">
        <PWAInstallButton variant="banner" />
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 pb-20 md:pb-12">
        {/* ===================================================== */}
        {/* TAB: HOME */}
        {/* ===================================================== */}
        {activeTab === 'home' && (
          <div>
            <HeroSection
              settings={settings}
              services={services}
              onBookAppointment={handleOpenGeneralBooking}
              onExploreServices={() => setActiveTab('services')}
              onSelectServiceToBook={handleBookSingleService}
            />

            <ServicesSection
              services={services}
              selectedServiceIds={selectedServiceIds}
              onToggleService={handleToggleService}
              onBookSelected={handleBookSelectedServices}
              onBookSingleService={handleBookSingleService}
            />

            <ContactSection
              settings={settings}
              onBookClick={handleOpenGeneralBooking}
            />
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB: SERVICES */}
        {/* ===================================================== */}
        {activeTab === 'services' && (
          <div className="pt-4">
            <ServicesSection
              services={services}
              selectedServiceIds={selectedServiceIds}
              onToggleService={handleToggleService}
              onBookSelected={handleBookSelectedServices}
              onBookSingleService={handleBookSingleService}
            />
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB: MY BOOKINGS */}
        {/* ===================================================== */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            settings={settings}
            onBookNew={handleOpenGeneralBooking}
          />
        )}

        {/* ===================================================== */}
        {/* TAB: CONTACT & MAP */}
        {/* ===================================================== */}
        {activeTab === 'contact' && (
          <ContactSection
            settings={settings}
            onBookClick={handleOpenGeneralBooking}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0c10] border-t border-[#c69214]/20 pt-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs sm:text-sm">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-[#c69214]/60 p-1 flex items-center justify-center">
                <img src="/icon.svg" alt="VJ Salon" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-serif-luxury text-xl font-extrabold text-white tracking-wider">
                VJ SALON
              </span>
            </div>
            <p className="text-neutral-400 text-xs max-w-md leading-relaxed">
              Dhamdha's premier salon for modern men. We specialize in precision fades, custom beard styling, detox facial scrubs, machine cleanups, and keratin hair spa.
            </p>
            <p className="text-[#f3cc51] text-xs font-semibold">
              Near Old Govt. Hospital, Dhamdha, Chhattisgarh
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider mb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-[#f3cc51] transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('services')} className="hover:text-[#f3cc51] transition">
                  Grooming Services & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('my-bookings')} className="hover:text-[#f3cc51] transition">
                  Check Booking Status
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-[#f3cc51] transition">
                  Location & Map
                </button>
              </li>
              <li>
                <button onClick={() => setIsAdminOpen(true)} className="hover:text-[#f3cc51] transition flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#f3cc51]" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Salon Contact */}
          <div className="space-y-2">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider mb-2">
              Contact & Hours
            </h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#f3cc51]" />
                <a href={`tel:${settings.phone}`} className="hover:underline">
                  +91 {settings.phone}
                </a>
              </p>
              {settings.additionalPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#f3cc51]" />
                  <a href={`tel:${settings.additionalPhone}`} className="hover:underline">
                    +91 {settings.additionalPhone}
                  </a>
                </p>
              )}
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <a
                  href={`https://wa.me/91${settings.whatsapp}?text=Hello%20VJ%20Salon`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  WhatsApp: +91 {settings.whatsapp}
                </a>
              </p>
              <p className="flex items-center gap-2 text-neutral-400">
                <Clock className="w-4 h-4 text-[#f3cc51]" />
                <span>Daily: 10:00 AM – 9:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} VJ Salon, Dhamdha. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built with precision for Android & Desktop PWA</span>
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Visible on phones) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={handleOpenGeneralBooking}
      />

      {/* Booking Wizard Modal */}
      <BookingWizard
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        settings={settings}
        preSelectedServiceIds={preSelectedServices}
        onBookingSuccess={() => {
          // Keep selection clean
          setSelectedServiceIds([]);
        }}
      />

      {/* Admin Control Center Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setIsAdminLoggedIn(!!getStoredAdminToken());
        }}
        onDataChanged={loadInitialData}
      />
    </div>
  );
}
