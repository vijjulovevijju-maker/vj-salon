import React from 'react';
import { Home, Scissors, Calendar, BookmarkCheck, MapPin } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c10]/95 backdrop-blur-xl border-t border-[#c69214]/25 py-1 px-2 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          id="btn-mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[58px] ${
            activeTab === 'home' ? 'text-[#f3cc51]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold mt-1">Home</span>
        </button>

        {/* Services */}
        <button
          id="btn-mobile-nav-services"
          onClick={() => setActiveTab('services')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[58px] ${
            activeTab === 'services' ? 'text-[#f3cc51]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scissors className={`w-5 h-5 ${activeTab === 'services' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold mt-1">Services</span>
        </button>

        {/* Book Button in Center */}
        <button
          id="btn-mobile-nav-book"
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full gold-button flex items-center justify-center shadow-lg shadow-[#c69214]/30 border-2 border-[#0a0a0c]">
            <Calendar className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#f3cc51] mt-0.5">Book</span>
        </button>

        {/* My Booking */}
        <button
          id="btn-mobile-nav-my-bookings"
          onClick={() => setActiveTab('my-bookings')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[58px] ${
            activeTab === 'my-bookings' ? 'text-[#f3cc51]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookmarkCheck className={`w-5 h-5 ${activeTab === 'my-bookings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold mt-1">My Booking</span>
        </button>

        {/* Contact */}
        <button
          id="btn-mobile-nav-contact"
          onClick={() => setActiveTab('contact')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[58px] ${
            activeTab === 'contact' ? 'text-[#f3cc51]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MapPin className={`w-5 h-5 ${activeTab === 'contact' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold mt-1">Contact</span>
        </button>
      </div>
    </div>
  );
};
