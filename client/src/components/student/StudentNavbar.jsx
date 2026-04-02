import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Bell, Search, User } from 'lucide-react';

const StudentNavbar = () => {
    const { user } = useContext(AppContext);

    return (
        <header className="h-20 glass-effect sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center bg-slate-100/50 px-6 py-2.5 rounded-2xl border border-slate-200/50 w-96 group focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all duration-300">
                <Search size={16} className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search your library..."
                    className="bg-transparent border-none outline-none ml-3 text-[13px] font-bold text-slate-600 w-full placeholder:text-slate-400"
                />
            </div>

            <div className="flex items-center gap-8">
                <button className="relative p-2.5 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-xl transition-all group active:scale-90">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse shadow-sm shadow-rose-500/50"></span>
                </button>

                <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                    <div className="text-right hidden sm:block">
                        <p className="text-[13px] font-black text-slate-900 leading-none tracking-tight">{user?.name || 'Student'}</p>
                        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1.5 opacity-80">{user?.role || 'Learner'}</p>
                    </div>
                    <div className="group cursor-pointer relative">
                        <div className="w-11 h-11 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;
