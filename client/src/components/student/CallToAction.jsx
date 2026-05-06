import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Check } from 'lucide-react';

const fallbackBullets = [
  'Modern course experience',
  'Seamless teaching workflows',
  'Centralized admin control',
  'Responsive across devices'
];

const accentClasses = [
  'bg-green-500/20 text-green-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-pink-500/20 text-pink-400'
];

const CallToAction = ({ config }) => {
  const { navigate } = useContext(AppContext);
  const bullets = config?.bullets?.length ? config.bullets : fallbackBullets;

  if (config?.enabled === false) return null;

  return (
    <section className="relative w-full bg-[var(--background)] px-6 py-28 md:px-12 lg:px-24">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-gradient-to-br from-[#161E3D] to-[#0C132B] p-10 shadow-2xl md:p-20">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal-600/5 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[150px]" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="mb-6 text-4xl font-black leading-tight tracking-tighter text-white md:text-5xl lg:text-6xl">
                {config?.title || 'Ready to level up your learning platform?'}
              </h2>
              <p className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-white/70">
                {config?.subtitle || 'Give students a premium learning experience and help educators manage content with confidence.'}
              </p>
              <div className="flex flex-col items-center gap-5 sm:flex-row lg:justify-start">
                <button
                  onClick={() => navigate(config?.primaryCtaLink || '/course-list')}
                  className="btn-primary w-full px-12 sm:w-auto"
                >
                  {config?.primaryCtaLabel || 'Start Learning'}
                </button>
                <button
                  onClick={() => navigate(config?.secondaryCtaLink || '/register')}
                  className="btn-secondary w-full border-white/10 px-12 hover:border-white/20 sm:w-auto"
                >
                  {config?.secondaryCtaLabel || 'Launch Teaching Panel'}
                </button>
              </div>
            </div>

            <div className="hidden max-w-md flex-1 lg:block">
              <div className="rotate-2 rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-3xl backdrop-blur-xl transition-transform duration-500 hover:rotate-0">
                {bullets.map((bullet, index) => (
                  <div key={`${bullet}-${index}`} className={`flex items-center gap-4 ${index !== bullets.length - 1 ? 'mb-8' : ''}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold shadow-lg ${accentClasses[index % accentClasses.length]}`}>
                      <Check size={20} />
                    </div>
                    <p className="text-lg font-bold text-white">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;


