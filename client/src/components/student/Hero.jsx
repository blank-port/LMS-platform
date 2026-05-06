import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, LayoutDashboard, Zap, Sparkles, Binary } from 'lucide-react';

const Hero = ({ config }) => {
    const { navigate } = useContext(AppContext);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <div className="relative w-full overflow-hidden bg-[var(--background)] pt-10 md:pt-14 student-theme">
            {/* --- Advanced Background Architecture --- */}
            {/* Animated Light Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-5%] w-[720px] h-[720px] bg-emerald-500/14 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 40, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] left-[-5%] w-[560px] h-[560px] bg-sky-400/14 rounded-full blur-[110px]"
            />
            <div className="absolute inset-x-0 top-24 mx-auto h-[560px] max-w-7xl rounded-[3rem] bg-gradient-to-br from-emerald-100/58 via-[var(--surface-tint)]/78 to-amber-50/42 shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-white/50 backdrop-blur-2xl" />

            <div className="container mx-auto px-6 md:px-12 lg:px-24 z-10 py-10 md:py-14">
                <div className="relative rounded-[3.5rem] border border-white/40 bg-white/10 px-6 py-10 shadow-[0_32px_120px_rgba(15,23,42,0.06)] backdrop-blur-3xl md:px-10 md:py-12 lg:px-12 overflow-hidden">
                    {/* Subtle Internal Glow */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[80px]" />
                    
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">

                    {/* --- Content Engine --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-3 bg-white/60 border border-white/70 px-5 py-2.5 rounded-2xl mb-8 backdrop-blur-xl group hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer shadow-sm">
                            <Sparkles size={16} className="text-emerald-600 animate-pulse" />
                            <span className="text-emerald-600 text-[10px] font-black tracking-[0.4em] uppercase">Learning Management System</span>
                        </div>

                        <h1 className="text-[2.2rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[4.8rem] xl:text-[5.4rem] font-black text-slate-900 leading-[0.92] mb-8 tracking-tighter max-w-4xl">
                            {config?.title || 'Build momentum with modern learning experiences'} <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">{config?.highlight || 'that feel premium'}</span>
                        </h1>

                        <p className="text-base md:text-lg text-slate-600 max-w-2xl mb-10 leading-8 font-bold mx-auto lg:mx-0 opacity-85">
                            {config?.subtitle || 'PrismEd helps students, educators, and administrators move through learning flows with clarity, speed, and confidence.'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                            <button 
                                onClick={() => navigate(config?.primaryCtaLink || '/course-list')}
                                className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-2xl shadow-emerald-900/20 uppercase tracking-[0.18em] text-[11px] relative group overflow-hidden"
                            >
                                <span className="relative z-10">{config?.primaryCtaLabel || 'Explore Courses'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </button>
                            <button 
                                onClick={() => navigate(config?.secondaryCtaLink || '/register')}
                                className="w-full sm:w-auto px-10 py-4 bg-white/60 backdrop-blur-md border border-white/70 text-slate-900 font-black rounded-2xl hover:bg-white hover:shadow-xl active:scale-95 transition-all duration-500 uppercase tracking-[0.18em] text-[11px]"
                            >
                                {config?.secondaryCtaLabel || 'Become an Instructor'}
                            </button>
                        </div>

                        {/* High-Fidelity Stats Section */}
                        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-slate-200/60 pt-8 sm:grid-cols-3 sm:gap-5">
                            {(config?.metrics || [
                                { value: '250+', label: 'Active courses' },
                                { value: '45K+', label: 'Learners' },
                                { value: '120+', label: 'Educators' }
                            ]).map((stat, i) => {
                                const MetricIcon = [Binary, Zap, Award][i % 3];
                                return (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="flex flex-col items-center lg:items-start group cursor-default rounded-[1.75rem] border border-white/70 bg-white/55 px-5 py-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <MetricIcon size={16} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors duration-300">{stat.value}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* --- Immersive Visual Core --- */}
                    <div className="flex-1 relative hidden lg:block perspective-1000">
                        <motion.div
                            style={{ y: y1 }}
                            className="relative w-full aspect-[0.94] max-w-xl mx-auto"
                        >
                            {/* Visual Engine Container */}
                            <motion.div 
                                initial={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="w-full h-full bg-slate-900 rounded-[4rem] relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.18)] border border-white/10 group"
                            >
                                <img 
                                    src="/prismed_ai_lab_core_1776094216387.png" 
                                    alt="PrismEd Core" 
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s]" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-emerald-500/10"></div>

                                {/* Inner UI Signal */}
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="glass-glow p-6 rounded-[2rem] border border-white/10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        animate={{ x: [-200, 400] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                        className="w-1/3 h-full bg-emerald-400 blur-sm"
                                                    />
                                                </div>
                                                <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Metadata Node 1 */}
                            <motion.div 
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-8 -right-8 glass-premium p-6 rounded-[2rem] border border-white/40 shadow-2xl z-20 max-w-[240px]"
                            >
                                <div className="flex items-center gap-5 mb-5">
                                    <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Elite Certification</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Global Standard</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Metadata Node 2 */}
                            <motion.div 
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-10 -left-10 glass-premium p-6 rounded-[2.4rem] border border-white/40 shadow-2xl z-20 max-w-[280px]"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-xl">
                                        <LayoutDashboard size={24} />
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                            <span>Intellect Progress</span>
                                            <span className="text-emerald-600">92%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                            <div className="h-full w-[92%] bg-emerald-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    </div>
                </div>
            </div>

            {/* Premium Ticker Bar */}
            <div className="relative mt-4 hidden md:block z-10">
                <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/60 bg-white/45 px-8 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
                    <div className="flex items-center justify-around opacity-50">
                        {['Computer Science', 'Business Strategy', 'Digital Marketing', 'Creative Design', 'Data Science'].map(cat => (
                            <span key={cat} className="text-[12px] font-black uppercase text-slate-500 tracking-[0.6em] hover:text-emerald-600 hover:opacity-100 transition-all cursor-crosshair">{cat}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;


