import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Gamepad2,
    Wallet,
    Award,
    MessageSquare,
    User,
    Settings,
    LogOut
} from 'lucide-react';

const StudentSidebar = () => {
    const { user, isEducator, logout } = useContext(AppContext);

    const studentItems = [
        { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My Courses', path: '/student/my-courses', icon: <BookOpen size={20} /> },
        { name: 'Assignments', path: '/student/assignments', icon: <FileText size={20} /> },
        { name: 'Quizzes', path: '/student/quizzes', icon: <Gamepad2 size={20} /> },
        { name: 'Wallet & Payments', path: '/student/wallet', icon: <Wallet size={20} /> },
        { name: 'Certificates', path: '/student/certificates', icon: <Award size={20} /> },
        { name: 'Support', path: '/student/support', icon: <MessageSquare size={20} /> },
        { name: 'Profile', path: '/student/profile', icon: <User size={20} /> },
    ];

    const instructorItems = [
        { name: 'Dashboard', path: '/educator', icon: <LayoutDashboard size={20} /> },
        { name: 'Teaching Panel', path: '/educator/my-courses', icon: <BookOpen size={20} /> },
    ];

    const navItems = isEducator ? instructorItems : studentItems;

    return (
        <aside className="w-72 h-screen bg-[var(--surface)] flex flex-col sticky top-0 transition-all duration-300 border-r border-[var(--border)] shadow-xl shadow-slate-200/40 overflow-y-auto no-scrollbar shrink-0">
            <div className="p-8 flex flex-col items-center border-b border-slate-100 mb-6">
                <div className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4 transform rotate-3 hover:rotate-0 transition-all duration-500">
                    <span className="text-white font-black text-2xl tracking-tighter">P</span>
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">PRISMED</span>
                <span className="text-[10px] font-black text-cyan-600 tracking-[0.3em] uppercase leading-none mt-2">Learning Lab</span>
            </div>

            <div className="px-6 flex-1">
                <nav className="space-y-1.5 mt-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group ${isActive
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/20 font-black'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-bold'
                                }`
                            }
                        >
                            <span className="transition-transform duration-300 group-hover:scale-110 opacity-70 group-hover:opacity-100">{item.icon}</span>
                            <span className="text-[11px] uppercase tracking-widest leading-none">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
                <button onClick={logout} className="flex items-center gap-4 px-6 py-4 w-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 uppercase text-[11px] font-black tracking-widest group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform opacity-60" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
