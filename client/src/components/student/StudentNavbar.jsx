import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { motion } from 'framer-motion';
import { Bell, Search, User, Zap } from 'lucide-react';

const StudentNavbar = () => {
    const { user } = useContext(AppContext);

    return (
        <header className="h-24 bg-white border-b border-slate-100 sticky top-0 z-40 px-10 flex items-center justify-between shadow-sm">
            {/* Intelligent Search Architecture */}
            <div className="flex items-center bg-white/60 px-8 py-3.5 rounded-[1.5rem] border border-white/80 w-[420px] group focus-within:ring-8 focus-within:ring-emerald-500/5 transition-all duration-500 shadow-sm">
                <Search size={16} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search curriculum, mentors, or sessions..."
                    className="bg-transparent border-none outline-none ml-4 text-[13px] font-bold text-slate-700 w-full placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                />
            </div>

            <div className="flex items-center gap-10">
                {/* Visual Signaling Node */}
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-3.5 bg-white/60 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-2xl transition-all group shadow-sm"
                >
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse shadow-lg shadow-rose-500/40"></span>
                </motion.button>

                <div className="flex items-center gap-6 pl-10 border-l border-slate-200/50">
                    <div className="text-right hidden lg:block">
                        <p className="text-[14px] font-black text-slate-900 leading-none tracking-tighter">{user?.name || 'Academic Scholar'}</p>
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <Zap size={10} className="text-emerald-500" />
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{user?.role || 'Verified Learner'}</p>
                        </div>
                    </div>
                    
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="group cursor-pointer relative"
                    >
                        <div className="w-13 h-13 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-emerald-900/10 group-hover:shadow-emerald-500/20 transition-all duration-500 overflow-hidden border-2 border-white">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                                user?.name?.charAt(0)?.toUpperCase() || 'P'
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-md"></div>
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;


