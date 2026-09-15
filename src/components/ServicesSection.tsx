import React, { useState } from 'react';
import { Clock, Check, Plus, Calendar, Sparkles, Scissors, Filter } from 'lucide-react';
import type { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  onBookSelected: () => void;
  onBookSingleService: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  selectedServiceIds,
  onToggleService,
  onBookSelected,
  onBookSingleService,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter((s) => s.category === activeCategory);

  const selectedCount = selectedServiceIds.length;
  const totalPrice = services
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#f3cc51] uppercase tracking-widest px-3 py-1 rounded-full bg-[#c69214]/15 border border-[#c69214]/30">
          PREMIUM GROOMING MENU
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-white mt-3">
          Our Salon Services & Pricing
        </h2>
        <p className="text-sm text-neutral-300 mt-2">
          Select one or multiple services. Clear, honest pricing with no hidden charges.
        </p>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-[#c69214] text-black shadow-md shadow-[#c69214]/20'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Floating Multi-service bar when items are selected */}
      {selectedCount > 0 && (
        <div className="sticky top-20 z-30 mb-8 p-4 rounded-2xl bg-neutral-900/95 border-2 border-[#f3cc51] shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c69214]/20 text-[#f3cc51] flex items-center justify-center font-extrabold text-sm">
              {selectedCount}
            </div>
            <div>
              <p className="text-xs text-neutral-400">Selected {selectedCount} service{selectedCount > 1 ? 's' : ''}</p>
              <p className="text-lg font-black text-white">
                Total: <span className="text-[#f3cc51]">₹{totalPrice}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBookSelected}
              className="gold-button px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg"
            >
              <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Continue Booking ({selectedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredServices.map((service) => {
          const isSelected = selectedServiceIds.includes(service.id);

          return (
            <div
              key={service.id}
              className={`relative rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-900/95 border-2 border-[#f3cc51] shadow-xl shadow-[#c69214]/15'
                  : 'bg-neutral-900/70 border border-neutral-800 hover:border-[#c69214]/40 hover:bg-neutral-900/90'
              }`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-md bg-[#c69214]/25 border border-[#c69214]/40 text-[#f3cc51] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Popular
                </span>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 pr-16 mb-2">
                  <h3 className="font-serif-luxury text-lg font-bold text-white leading-snug">
                    {service.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                  <span className="flex items-center gap-1 text-[#f3cc51] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    ~{service.duration} mins
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px]">
                    {service.category}
                  </span>
                </div>

                {service.description && (
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-neutral-400 block -mb-0.5">Price</span>
                  <span className="text-2xl font-black text-white">
                    ₹{service.price}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Select / Add to Multi-select toggle */}
                  <button
                    id={`btn-select-service-${service.id}`}
                    onClick={() => onToggleService(service.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-[#c69214] text-black'
                        : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                    }`}
                    title={isSelected ? 'Remove from selection' : 'Add to multiple services'}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </>
                    )}
                  </button>

                  {/* Book Now Button */}
                  <button
                    id={`btn-book-now-${service.id}`}
                    onClick={() => onBookSingleService(service.id)}
                    className="gold-button px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow"
                  >
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
