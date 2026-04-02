import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { assets } from '../../assets/assets';
import { motion } from 'framer-motion';
import { Award, LayoutDashboard } from 'lucide-react';

const Hero = () => {
  const { navigate } = useContext(AppContext);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-[var(--background)] overflow-hidden pt-20 student-theme">
      {/* Dynamic Background Surface */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      
      <div className="container mx-auto px-6 md:px-12 lg:px-24 z-10 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Core Content Engine */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 px-6 py-3 rounded-2xl mb-12 backdrop-blur-xl group hover:bg-cyan-500/20 transition-all duration-500 cursor-pointer">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </div>
              <span className="text-cyan-600 text-[11px] font-black tracking-[0.3em] uppercase">Intelligence Evolved</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-9xl font-black text-slate-900 leading-[0.85] mb-10 tracking-tighter">
              Unlock Your <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">Full Potential</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mb-16 leading-relaxed font-bold mx-auto lg:mx-0 opacity-80">
              Access the world's most advanced learning ecosystem. From quantum computing to generative design, master the skills of tomorrow, today.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/course-list')}
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-blue-500/30 uppercase tracking-widest text-sm"
              >
                Start Learning Now
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-12 py-5 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-50 hover:border-blue-500/20 active:scale-95 transition-all duration-500 uppercase tracking-widest text-sm"
              >
                Become Instructor
              </button>
            </div>

            {/* High-Fidelity Stats Section */}
            <div className="mt-24 grid grid-cols-3 gap-12 border-t border-slate-100 pt-16">
              {[
                { val: '250+', label: 'Premium Courses' },
                { val: '45K+', label: 'Global Students' },
                { val: '120+', label: 'Elite Mentors' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start group">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors duration-300">{stat.val}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Immersive Visual Composition */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              {/* Dynamic Orbital Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] border border-slate-100 rounded-[4rem] rotate-45 animate-spin-slow"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-slate-200/50 rounded-[3rem] -rotate-12"></div>

              {/* Floating Interactive Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 p-8 glass-effect rounded-[2.5rem] border border-white/50 shadow-2xl z-30 max-w-[260px]"
              >
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Award size={24} />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-24 bg-slate-900 rounded-full"></div>
                    <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mastery Verified</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 p-8 glass-effect rounded-[2.5rem] border border-white/50 shadow-2xl z-30 max-w-[280px]"
              >
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <LayoutDashboard size={24} />
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-blue-600"></div>
                    </div>
                    <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] text-blue-600 font-black">85%</span>
                </div>
              </motion.div>

              {/* Main Visual Core - The "Lab" */}
              <div className="w-full h-full bg-white border border-slate-100 rounded-[5rem] relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.05)] transform hover:scale-[1.02] transition-transform duration-1000">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white"></div>
                
                {/* Abstract UI Elements */}
                <div className="absolute inset-0 p-16 flex flex-col justify-start space-y-10">
                  <div className="space-y-4">
                    <div className="h-10 w-full bg-slate-100 rounded-2xl"></div>
                    <div className="h-10 w-4/5 bg-slate-50 rounded-2xl"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="aspect-square bg-blue-50 rounded-3xl border border-blue-100/50"></div>
                    <div className="aspect-square bg-cyan-50 rounded-3xl border border-cyan-100/50"></div>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-3 w-1/2 bg-slate-200 rounded-full"></div>
                      <div className="h-3 w-1/3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Focus Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Footer Marquee */}
      <div className="absolute bottom-0 left-0 w-full bg-white/50 border-t border-slate-100 py-10 overflow-hidden hidden md:block backdrop-blur-2xl">
        <div className="flex items-center justify-around opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
          {['Cybersecurity', 'Web Architecture', 'AI & Data', 'UX Philosophy', 'Cloud Strategy'].map(cat => (
            <span key={cat} className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] hover:text-blue-600 hover:opacity-100 transition-all cursor-crosshair">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
