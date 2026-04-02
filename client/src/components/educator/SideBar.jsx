import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import SafeImage from '../common/SafeImage.jsx';
import {
    BarChart3, PlusCircle, BookOpen, Users, HelpCircle,
    MessageSquare, ChevronDown, ChevronRight, Wallet,
    TrendingUp, PieChart, ShoppingBag, Settings
} from 'lucide-react';

const menuStructure = [
    {
        type: 'link',
        path: '/educator',
        icon: BarChart3,
        label: 'Dashboard',
        end: true
    },
    {
        type: 'group',
        label: 'My Panel',
        icon: ShoppingBag,
        children: [
            { path: '/educator/my-panel?tab=purchase_history', label: 'Purchase History', matchPath: '/educator/my-panel' },
            { path: '/educator/my-panel?tab=refund_cancellation', label: 'Refund & Cancellation' },
            { path: '/educator/my-panel?tab=referral', label: 'Referral' },
            { path: '/educator/my-panel?tab=logged_in_device', label: 'Logged In Device' },
            { path: '/educator/my-panel?tab=certificates', label: 'My Certificate' },
            { path: '/educator/my-panel?tab=deposit', label: 'Deposit' },
            { path: '/educator/my-panel?tab=topics', label: 'My Topics' },
        ]
    },
    {
        type: 'section',
        label: 'USERS'
    },
    {
        type: 'group',
        label: 'Instructors',
        icon: Users,
        children: [
            { path: '/educator/payouts', label: 'Payout List' },
        ]
    },
    {
        type: 'section',
        label: 'EDUCATION'
    },
    {
        type: 'group',
        label: 'Courses',
        icon: BookOpen,
        children: [
            { path: '/educator/my-courses', label: 'All Courses' },
            { path: '/educator/add-course', label: 'Add Course' },
            { path: '/educator/course-settings', label: 'Course Settings' },
        ]
    },
    {
        type: 'group',
        label: 'Quiz',
        icon: HelpCircle,
        children: [
            { path: '/educator/question-group', label: 'Question Group' },
            { path: '/educator/add-question', label: 'Add Question' },
            { path: '/educator/question-bank', label: 'Question Bank' },
            { path: '/educator/question-import', label: 'Question Import' },
            { path: '/educator/create-quiz', label: 'Add Quiz' },
        ]
    },
    {
        type: 'group',
        label: 'Report',
        icon: PieChart,
        children: [
            { path: '/educator/quiz-reports', label: 'Quiz Reports' },
            { path: '/educator/revenue', label: 'Instructor Revenue' },
            { path: '/educator/course-stats', label: 'Course Statistics' },
        ]
    },
    {
        type: 'section',
        label: 'COMMUNICATION'
    },
    {
        type: 'group',
        label: 'Communications',
        icon: MessageSquare,
        children: [
            { path: '/educator/communication', label: 'Private Message' },
        ]
    },
    {
        type: 'group',
        label: 'Q&A',
        icon: HelpCircle,
        children: [
            { path: '/educator/qa', label: 'Question List' },
        ]
    },
    {
        type: 'link',
        path: '/educator/settings',
        icon: Settings,
        label: 'Settings',
    },
];

const SideBar = () => {
    const { user } = useContext(AppContext);
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (label) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <aside className="w-72 h-[calc(100vh-80px)] bg-[var(--surface)] border-r border-[var(--border)] pt-8 hidden md:block fixed top-20 left-0 z-40 overflow-y-auto no-scrollbar shadow-xl shadow-slate-200/40">
            <div className="px-8 mb-8 flex items-center gap-3.5">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Studio Active</span>
            </div>

            <nav className="px-4 space-y-1">
                {menuStructure.map((item, idx) => {
                    if (item.type === 'section') {
                        return (
                            <div key={idx} className="pt-8 pb-3 px-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">{item.label}</span>
                            </div>
                        );
                    }

                    if (item.type === 'link') {
                        return (
                            <NavLink
                                key={idx}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black transition-all duration-500 group ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                            >
                                <item.icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${window.location.pathname === item.path ? 'opacity-100' : 'opacity-60 grayscale group-hover:grayscale-0'}`} />
                                <span className="tracking-tight uppercase tracking-widest text-[11px]">{item.label}</span>
                            </NavLink>
                        );
                    }

                    if (item.type === 'group') {
                        const isOpen = openGroups[item.label];
                        const Icon = item.icon;

                        return (
                            <div key={idx} className="space-y-1">
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    className={`w-full flex items-center justify-between gap-4 px-6 py-4 rounded-2xl text-[13px] font-black transition-all duration-300 group ${isOpen ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${isOpen ? 'opacity-100 text-blue-600' : 'opacity-60 grayscale group-hover:grayscale-0'}`} />
                                        <span className="tracking-tight uppercase tracking-widest text-[11px]">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className={`transition-transform duration-300 opacity-40 ${isOpen ? 'rotate-90 text-blue-600 opacity-100' : ''}`} />
                                </button>
                                {isOpen && (
                                    <div className="ml-10 pl-6 border-l-2 border-slate-100 space-y-1 py-1">
                                        {item.children.map((child, ci) => (
                                            <NavLink
                                                key={ci}
                                                to={child.path}
                                                end
                                                className={({ isActive }) => `block px-5 py-3 rounded-xl text-[12px] font-bold transition-all duration-300 ${isActive || (child.matchPath && window.location.pathname === child.matchPath)
                                                    ? 'text-blue-600 bg-blue-50 font-black'
                                                    : 'text-slate-400 hover:text-blue-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </nav>

            {/* Studio Profile Card */}
            <div className="mt-10 mx-6 p-6 glass-effect rounded-[2rem] border border-slate-100 mb-10 shadow-lg shadow-slate-200/30 group hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {user?.avatar ? (
                            <SafeImage src={user.avatar} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-lg" />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-xl shadow-blue-500/20">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-black text-slate-900 tracking-tighter leading-none truncate">{user?.name}</span>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2 opacity-80">Managing Instructor</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SideBar;
