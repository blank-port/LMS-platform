import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { assets } from '../../assets/assets';

const Hero = () => {
  const { navigate } = useContext(AppContext);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-[var(--background)] overflow-hidden pt-20">
      {/* Background Orbs & Gradients - Enhanced for depth */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#7C32FF]/10 rounded-full blur-[150px] -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--background)_70%)] opacity-60"></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 z-10 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2.5 rounded-full mb-10 backdrop-blur-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <span className="text-indigo-300 text-[10px] font-black tracking-[0.25em] uppercase">The Future of Education</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[var(--text-main)] leading-[0.95] mb-10 tracking-tighter">
              Master the <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[#7C32FF] via-[#6366F1] to-[#FF3278] bg-clip-text text-transparent">Digital Frontier</span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--text-muted)] max-w-2xl mb-14 leading-relaxed font-medium mx-auto lg:mx-0">
              Access curated courses from global industry titans. Elevate your skills with immersive projects and professional certifications designed for the modern economy.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/course-list')}
                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-4 px-12 py-5 text-lg"
              >
                <span>Browse Catalog</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-4 px-12 py-5 text-lg"
              >
                Join as Educator
              </button>
            </div>

            {/* Premium Stats Row */}
            <div className="mt-24 flex flex-wrap justify-center lg:justify-start gap-16 border-t border-white/5 pt-12">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[var(--text-main)] tracking-tighter">120+</span>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 opacity-60">Curated Courses</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[var(--text-main)] tracking-tighter">80+</span>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 opacity-60">Verified Experts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[var(--text-main)] tracking-tighter">15K+</span>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 opacity-60">Global Learners</span>
              </div>
            </div>
          </div>

          {/* Right Imagery - Professional Abstract Composition */}
          <div className="flex-1 relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              {/* Decorative Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/5 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-full"></div>

              {/* Floating Professional Cards */}
              <div className="absolute -top-4 right-10 p-8 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-bounce-slow z-30 max-w-[240px]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 font-black">✓</div>
                  <div className="space-y-2">
                    <div className="h-2 w-20 bg-white/20 rounded-full"></div>
                    <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Skill Validated</p>
              </div>

              <div className="absolute bottom-10 -left-12 p-8 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-float z-30 max-w-[260px]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#7C32FF]/20 rounded-2xl flex items-center justify-center text-[#7C32FF] text-2xl">⚡</div>
                  <div className="space-y-2">
                    <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                    <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-2 h-2 bg-[#7C32FF] rounded-full"></div>)}
                </div>
              </div>

              {/* Main Visual Core */}
              <div className="w-full h-full bg-gradient-to-br from-[#161E3D] to-[#0C132B] border border-white/10 rounded-[5rem] relative overflow-hidden shadow-3xl transform -rotate-3 hover:rotate-0 transition-all duration-1000">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-[#7C32FF] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                </div>
                {/* Internal UI Mockup Elements */}
                <div className="absolute inset-0 p-12 flex flex-col justify-end space-y-6">
                  <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
                  <div className="h-4 w-3/4 bg-white/20 rounded-full"></div>
                  <div className="h-4 w-2/3 bg-white/5 rounded-full"></div>
                  <div className="pt-8 flex gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl"></div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl"></div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Navigation Tags */}
      <div className="absolute bottom-0 left-0 w-full bg-[var(--surface)]/30 border-t border-white/5 py-8 overflow-hidden hidden md:block backdrop-blur-3xl">
        <div className="flex items-center justify-center gap-16 whitespace-nowrap opacity-20">
          {['Cybersecurity', 'Full-stack Development', 'AI Engineering', 'Digital Marketing', 'Data Science', 'UI/UX Design', 'Cloud Architecture'].map(cat => (
            <span key={cat} className="text-xs font-black uppercase text-[var(--text-main)] tracking-[0.5em] hover:text-[#7C32FF] hover:opacity-100 transition-all cursor-crosshair">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
