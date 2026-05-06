import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    Gamepad2,
    Wallet,
    Award,
    MessageSquare,
    User,
    ShieldCheck,
    Users,
    Gift,
    RotateCcw,
    Heart,
    History,
    TrendingUp,
    LogOut,
    Sparkles,
    FileText
} from 'lucide-react';

const StudentSidebar = () => {
    const { user, isEducator, logout } = useContext(AppContext);

    const sections = [
        {
            title: 'Learning core',
            items: [
                { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
                { name: 'My Courses', path: '/student/my-courses', icon: <BookOpen size={18} /> },
                { name: 'Neural Relay', path: '/student/messages', icon: <MessageSquare size={18} /> },
                { name: 'Quizzes', path: '/student/quizzes', icon: <Gamepad2 size={18} /> },
                { name: 'Revision Vault', path: '/student/revision', icon: <Sparkles size={18} /> },
                { name: 'Academic Tasks', path: '/student/assignments', icon: <FileText size={18} /> },
                { name: 'Certificates', path: '/student/certificates', icon: <Award size={18} /> },
            ]

        },
        {
            title: 'Strategic assets',
            items: [
                { name: 'Wallet', path: '/student/wallet', icon: <Wallet size={18} /> },
                { name: 'Rewards', path: '/student/rewards', icon: <Gift size={18} /> },
                { name: 'Referral', path: '/student/referral', icon: <Users size={18} /> },
                { name: 'Wishlist', path: '/student/wishlist', icon: <Heart size={18} /> },
            ]
        },
        {
            title: 'Operations',
            items: [
                { name: 'Transcripts', path: '/student/purchase-history', icon: <History size={18} /> },
                { name: 'Refunds', path: '/student/refunds', icon: <RotateCcw size={18} /> },
                { name: 'Security', path: '/student/security', icon: <ShieldCheck size={18} /> },
                { name: 'Profile', path: '/student/profile', icon: <User size={18} /> },
            ]
        }
    ];

    const navItems = isEducator ? [
        { name: 'Instructor Studio', path: '/educator', icon: <TrendingUp size={18} />, isHeaded: true },
    ] : [];

    return (
        <aside className="w-80 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0 transition-all duration-300 shadow-2xl shadow-emerald-500/5 overflow-y-auto no-scrollbar shrink-0 z-50">
            <div className="p-10 flex flex-col items-center mb-8">
                <motion.div 
                    initial={{ scale: 0.8, rotate: -5 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl shadow-emerald-900/20"
                >
                    P
                </motion.div>
                <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">PRISMED</span>
                <span className="text-[9px] font-black text-emerald-600 tracking-[0.4em] uppercase leading-none mt-3 opacity-60">Architect Edition</span>
            </div>

            <div className="px-8 flex-1">
                <nav className="space-y-8 mt-4">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="px-6 pb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-40">{section.title}</span>
                            </div>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-5 px-6 py-4 rounded-[1.2rem] transition-all duration-500 group relative ${isActive
                                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span className={`transition-all duration-500 ${isActive ? 'scale-110 opacity-100 text-emerald-400' : 'opacity-50 group-hover:opacity-100 group-hover:scale-110 group-hover:text-emerald-500'}`}>{item.icon}</span>
                                                <span className={`text-[10px] uppercase tracking-[0.15em] leading-none font-black ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{item.name}</span>
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="active-pill"
                                                        className="absolute left-[-2px] w-1 h-5 bg-emerald-500 rounded-full"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}

                    {navItems.map((item) => (
                        <div key={item.path} className="pt-6 border-t border-slate-900/5">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative ${isActive
                                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                                        : 'bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                                    }`
                                }
                            >
                                <TrendingUp size={18} />
                                <span className="text-[11px] uppercase tracking-[0.15em] leading-none font-black">Instruction Studio</span>
                            </NavLink>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-10 border-t border-white/10">
                <button onClick={logout} className="flex items-center gap-5 px-8 py-5 w-full bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[1.5rem] transition-all duration-500 uppercase text-[10px] font-black tracking-widest group shadow-sm hover:shadow-rose-500/20">
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;




