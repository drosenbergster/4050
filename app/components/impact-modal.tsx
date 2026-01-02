'use client';

import { useState } from 'react';
import { X, Sprout, Heart } from 'lucide-react';

export default function ImpactModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Trigger Banner - Consistent across pages */}
      <div 
        onClick={openModal}
        className="w-full bg-[#4A7C59] cursor-pointer hover:bg-[#3D6649] transition-colors py-3 px-4 flex items-center justify-center gap-2 text-white shadow-sm"
      >
        <Sprout size={16} className="text-[#E8F0EA]" />
        <span className="text-sm font-medium tracking-wide">
          100% Profits to Community • See How It Works
        </span>
      </div>

      {/* Modal Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-[#636E72] hover:text-[#5C4A3D] hover:bg-[#F5EDE4] rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Side - 100% Promise */}
              <div className="bg-[#4A7C59] text-white p-8 md:p-10 md:w-2/5 flex flex-col justify-center text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">100%</h2>
                <div className="text-sm font-medium opacity-90 mb-6 uppercase tracking-wider">
                  Of Profits Donated
                </div>
                <p className="text-sm leading-relaxed opacity-90">
                  We don&apos;t keep a penny. Every purchase supports local food banks, community gardens, and families in need.
                </p>
              </div>

              {/* Right Side - How it Works */}
              <div className="p-8 md:p-10 md:w-3/5 bg-[#FDF8F3]">
                <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-6">
                  You Choose Where Help Grows
                </h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0EA] text-[#4A7C59] flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-[#5C4A3D] text-sm mb-1">Shop & Earn Seeds</h4>
                      <p className="text-sm text-[#636E72]">
                        Every $10 spent in the store earns one seed to support local causes.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0EA] text-[#4A7C59] flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-[#5C4A3D] text-sm mb-1">Pick a Cause</h4>
                      <p className="text-sm text-[#636E72]">
                        At checkout, choose which local organization you want your seeds to support.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0EA] text-[#4A7C59] flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-[#5C4A3D] text-sm mb-1">We Distribute</h4>
                      <p className="text-sm text-[#636E72]">
                        Twice a year, we tally the seeds and distribute 100% of profits proportionally.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E5DDD3] text-center">
                  <p className="text-xs text-[#8B7355] italic">
                    &quot;From our kitchen to the community&apos;s table.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

