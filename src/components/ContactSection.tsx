import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation, ShieldCheck, Award } from 'lucide-react';
import type { SalonSettings } from '../types';

interface ContactSectionProps {
  settings: SalonSettings;
  onBookClick: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, onBookClick }) => {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact Info Card */}
        <div className="lg:col-span-6 rounded-3xl bg-neutral-900 border border-[#c69214]/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <span className="text-xs font-bold text-[#f3cc51] uppercase tracking-widest px-3 py-1 rounded-full bg-[#c69214]/15 border border-[#c69214]/30">
              LOCATION & REACH
            </span>
            
            <h2 className="font-serif-luxury text-3xl font-extrabold text-white mt-3">
              Visit VJ Salon in Dhamdha
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 mt-2">
              Near Old Govt. Hospital, easy parking and air-conditioned luxury lounge for men.
            </p>

            <div className="mt-8 space-y-4 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-[#c69214]/20 border border-[#c69214]/40 text-[#f3cc51] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase">Salon Address</p>
                  <p className="font-bold text-white mt-0.5">{settings.address}</p>
                  <p className="text-[11px] text-[#f3cc51] mt-1">Landmark: Near Old Govt. Hospital</p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-[#c69214]/20 border border-[#c69214]/40 text-[#f3cc51] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase">Contact Numbers</p>
                  <div className="flex flex-wrap gap-4 mt-1 font-bold">
                    <a href={`tel:${settings.phone}`} className="text-[#f3cc51] hover:underline">
                      +91 {settings.phone} (Primary)
                    </a>
                    {settings.additionalPhone && (
                      <a href={`tel:${settings.additionalPhone}`} className="text-neutral-300 hover:underline">
                        +91 {settings.additionalPhone} (Alternative)
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-[#c69214]/20 border border-[#c69214]/40 text-[#f3cc51] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase">Salon Hours</p>
                  <p className="font-bold text-white mt-0.5">
                    Open Daily: 10:00 AM – 9:00 PM
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">Appointments & Walk-ins welcome</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 sm:pt-8 mt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              id="btn-contact-get-directions"
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow text-center"
            >
              <Navigation className="w-4 h-4 text-black" />
              <span>Get Directions on Google Maps</span>
            </a>

            <a
              id="btn-contact-whatsapp"
              href={`https://wa.me/91${settings.whatsapp}?text=Hello%20VJ%20Salon,%20I%20would%20like%20to%20visit%20the%20salon.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Message</span>
            </a>
          </div>
        </div>

        {/* Interactive Map Visual & Amenities */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          
          {/* Map Preview Container */}
          <div className="rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl relative min-h-[260px] flex-1 flex flex-col">
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#f3cc51]" />
                <span className="text-xs font-bold text-white">Google Maps Pin: Dhamdha, CG</span>
              </div>
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#f3cc51] hover:underline font-semibold"
              >
                Open Full Map &rarr;
              </a>
            </div>

            <div className="relative flex-1 bg-neutral-950 flex items-center justify-center p-6 text-center">
              {/* Stylized custom map graphic card */}
              <div className="max-w-sm space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#c69214]/20 border border-[#c69214] text-[#f3cc51] flex items-center justify-center mx-auto shadow-lg shadow-[#c69214]/20">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="font-serif-luxury text-lg font-bold text-white">VJ SALON</h4>
                <p className="text-xs text-neutral-400">
                  Near Old Govt. Hospital, Dhamdha, Chhattisgarh
                </p>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#f3cc51]" />
                  <span>Start Navigation (GPS)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Salon Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <ShieldCheck className="w-5 h-5 text-[#f3cc51] mb-1.5" />
              <h5 className="text-xs font-bold text-white">Sanitized & Clean</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Fresh towels, sterilized scissors & razor blades for every client.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <Award className="w-5 h-5 text-[#f3cc51] mb-1.5" />
              <h5 className="text-xs font-bold text-white">Top Rated Stylists</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Experienced barbers trained in modern fades, hair spas & detan.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
