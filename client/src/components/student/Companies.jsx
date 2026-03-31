import React from 'react';
import { assets } from '../../assets/assets';

const Companies = () => {
  return (
    <div className="py-32 bg-[var(--background)] relative w-full overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-4 mb-16 px-6 py-2 bg-white/5 rounded-full border border-white/5">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[var(--background)] flex items-center justify-center text-[8px] font-black">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Institutional Partners</p>
          </div>
          
          <div className="w-full relative">
            {/* Gradient Overlays for smooth fade out */}
            <div className="absolute left-0 top-0 w-40 h-full bg-gradient-to-r from-[var(--background)] to-transparent z-10 hidden md:block"></div>
            <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-[var(--background)] to-transparent z-10 hidden md:block"></div>
            
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
              <img className='h-7 md:h-9 object-contain filter brightness-0 invert' src={assets.microsoft_logo} alt="Microsoft" />
              <img className='h-7 md:h-9 object-contain filter brightness-0 invert' src={assets.walmart_logo} alt="Walmart" />
              <img className='h-7 md:h-9 object-contain filter brightness-0 invert' src={assets.accenture_logo} alt="Accenture" />
              <img className='h-7 md:h-9 object-contain filter brightness-0 invert' src={assets.adobe_logo} alt="Adobe" />
              <img className='h-7 md:h-9 object-contain filter brightness-0 invert' src={assets.paypal_logo} alt="Paypal" />
            </div>
          </div>
          
          <p className="mt-16 text-[var(--text-muted)] text-sm font-medium opacity-40">Trusted by modern organizations worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default Companies;
