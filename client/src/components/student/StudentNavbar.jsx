import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Bell, Search, User } from 'lucide-react';

const StudentNavbar = () => {
    const { user } = useContext(AppContext);

    return (
        <header className="h-24 bg-white border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 w-96 group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <Search size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search courses, lessons, assignments..."
                    className="bg-transparent border-none outline-none ml-4 text-xs font-bold text-gray-700 w-full placeholder:text-gray-300"
                />
            </div>

            <div className="flex items-center gap-10">
                <button className="relative p-2 text-gray-400 hover:text-indigo-500 transition-colors group">
                    <Bell size={22} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>

                <div className="flex items-center gap-5 border-l border-gray-100 pl-10">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{user?.name || 'Student'}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{user?.role || 'Learner'}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-0.5 shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-indigo-500 font-black text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;
