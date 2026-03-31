import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';

const CallToAction = () => {
  const { navigate } = useContext(AppContext);

  return (
    <section className="py-28 px-6 md:px-12 lg:px-24 bg-[var(--background)] relative w-full">
      <div className="container mx-auto">
        <div className="relative bg-gradient-to-br from-[#161E3D] to-[#0C132B] rounded-[3rem] p-10 md:p-20 overflow-hidden shadow-2xl border border-white/5">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C32FF]/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tighter">
                Ready to <span className="bg-gradient-to-r from-[#7C32FF] to-[#FF3278] bg-clip-text text-transparent">Transform</span> <br />
                Your Professional Future?
              </h2>
              <p className="text-white/40 text-lg font-medium max-w-xl mb-10 leading-relaxed">
                Join thousands of learners who are already mastering new skills and advancing their careers with PrismEd's world-class education platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <button onClick={() => navigate('/course-list')} className="w-full sm:w-auto btn-primary px-12">Get Started Now</button>
                <button onClick={() => navigate('/login?mode=register')} className="w-full sm:w-auto btn-secondary px-12 border-white/10 hover:border-white/20">Become Instructor</button>
              </div>
            </div>

            <div className="flex-1 max-w-md hidden lg:block">
              <div className="p-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-3xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 font-bold shadow-lg">✓</div>
                  <p className="text-white text-lg font-bold">Lifetime access to courses</p>
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C32FF]/20 flex items-center justify-center text-[#7C32FF] font-bold shadow-lg">✓</div>
                  <p className="text-white text-lg font-bold">Industry certificates</p>
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shadow-lg">✓</div>
                  <p className="text-white text-lg font-bold">1-on-1 mentor support</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold shadow-lg">✓</div>
                  <p className="text-white text-lg font-bold">Money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
