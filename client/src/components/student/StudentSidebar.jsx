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
        <aside className="w-72 h-screen bg-[#0C132B] text-white flex flex-col sticky top-0 transition-all duration-300 border-r border-white/5 shadow-2xl overflow-y-auto custom-scrollbar">
            <div className="p-10">
                <div className="mb-6"></div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <span className="transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                            <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-10 border-t border-white/5">
                <button onClick={logout} className="flex items-center gap-4 px-6 py-4 w-full text-white/40 hover:text-rose-400 transition-colors uppercase text-[11px] font-black tracking-widest group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
