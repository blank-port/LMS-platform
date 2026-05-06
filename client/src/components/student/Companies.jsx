import React from 'react';
import { assets } from '../../assets/assets';

const Companies = () => {
  return (
    <div className="py-16 bg-[var(--background)] relative w-full overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-center rounded-[2.5rem] border border-white/60 bg-white/40 px-6 py-10 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="inline-flex items-center gap-4 mb-10 px-6 py-2.5 bg-[var(--surface-tint)]/70 rounded-full border border-white/60">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[var(--background)] flex items-center justify-center text-[8px] font-black">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em]">Institutional Partners</p>
          </div>
          
          <div className="w-full relative">
            {/* Gradient Overlays for smooth fade out */}
            <div className="absolute left-0 top-0 w-40 h-full bg-gradient-to-r from-[var(--background)] to-transparent z-10 hidden md:block"></div>
            <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-[var(--background)] to-transparent z-10 hidden md:block"></div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-70 grayscale-[0.15] hover:opacity-100 transition-all duration-700">
              <div className="rounded-2xl border border-white/70 bg-white/60 px-6 py-5 shadow-sm"><img className='h-6 md:h-8 object-contain' src={assets.microsoft_logo} alt="Microsoft" /></div>
              <div className="rounded-2xl border border-white/70 bg-white/60 px-6 py-5 shadow-sm"><img className='h-6 md:h-8 object-contain' src={assets.walmart_logo} alt="Walmart" /></div>
              <div className="rounded-2xl border border-white/70 bg-white/60 px-6 py-5 shadow-sm"><img className='h-6 md:h-8 object-contain' src={assets.accenture_logo} alt="Accenture" /></div>
              <div className="rounded-2xl border border-white/70 bg-white/60 px-6 py-5 shadow-sm"><img className='h-6 md:h-8 object-contain' src={assets.adobe_logo} alt="Adobe" /></div>
              <div className="rounded-2xl border border-white/70 bg-white/60 px-6 py-5 shadow-sm"><img className='h-6 md:h-8 object-contain' src={assets.paypal_logo} alt="Paypal" /></div>
            </div>
          </div>
          
          <p className="mt-10 text-[var(--text-muted)] text-sm font-semibold opacity-80">Trusted by modern organizations worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default Companies;




