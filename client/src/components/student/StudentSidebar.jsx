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
    LogOut,
    History,
    ShieldCheck,
    Users,
    Gift,
    RotateCcw,
    Heart
} from 'lucide-react';

const StudentSidebar = () => {
    const { user, isEducator, logout } = useContext(AppContext);

    const studentItems = [
        { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Wishlist', path: '/student/wishlist', icon: <Heart size={18} /> },
        { name: 'My Courses', path: '/student/my-courses', icon: <BookOpen size={18} /> },
        { name: 'Quizzes', path: '/student/quizzes', icon: <Gamepad2 size={18} /> },
        { name: 'Purchase History', path: '/student/purchase-history', icon: <History size={18} /> },
        { name: 'Refund & Cancellation', path: '/student/refunds', icon: <RotateCcw size={18} /> },
        { name: 'Wallet & Deposits', path: '/student/wallet', icon: <Wallet size={18} /> },
        { name: 'Reward Points', path: '/student/rewards', icon: <Gift size={18} /> },
        { name: 'Referral', path: '/student/referral', icon: <Users size={18} /> },
        { name: 'Certificates', path: '/student/certificates', icon: <Award size={18} /> },
        { name: 'Messages', path: '/student/messages', icon: <MessageSquare size={18} /> },
        { name: 'Support Tickets', path: '/student/support', icon: <Users size={18} /> },
        { name: 'Device Security', path: '/student/security', icon: <ShieldCheck size={18} /> },
        { name: 'Account Settings', path: '/student/profile', icon: <User size={18} /> },
    ];

    const instructorItems = [
        { name: 'Dashboard', path: '/educator', icon: <LayoutDashboard size={20} /> },
        { name: 'Teaching Panel', path: '/educator/my-courses', icon: <BookOpen size={20} /> },
    ];

    const navItems = isEducator ? instructorItems : studentItems;

    return (
        <aside className="w-72 h-screen bg-[var(--surface)] flex flex-col sticky top-0 transition-all duration-300 border-r border-[var(--border)] shadow-xl shadow-slate-200/40 overflow-y-auto no-scrollbar shrink-0">
            <div className="p-8 flex flex-col items-center border-b border-slate-100 mb-6">
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
