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
            { path: '/educator/my-panel?tab=certificates', label: 'My Certificates' },
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
        ]
    },
    {
        type: 'group',
        label: 'Quiz',
        icon: HelpCircle,
        children: [
            { path: '/educator/create-quiz', label: 'Add Quiz' },
            { path: '/educator/question-bank', label: 'Question Bank' },
            { path: '/educator/quiz-reports', label: 'Quiz Reports' },
        ]
    },
    {
        type: 'group',
        label: 'Report',
        icon: PieChart,
        children: [
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
        <aside className="w-72 h-[calc(100vh-80px)] bg-slate-950 border-r border-slate-900 pt-8 hidden md:block fixed top-20 left-0 z-40 overflow-y-auto">
            <div className="px-6 mb-8">
                <div className="flex items-center gap-3 px-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Studio Active</span>
                </div>
            </div>

            <nav className="px-3 space-y-0.5">
                {menuStructure.map((item, idx) => {
                    if (item.type === 'section') {
                        return (
                            <div key={idx} className="pt-7 pb-2 px-5">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">{item.label}</span>
                            </div>
                        );
                    }

                    if (item.type === 'link') {
                        return (
                            <NavLink
                                key={idx}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `flex items-center gap-3 px-5 py-3 rounded-xl text-[12px] font-bold transition-all duration-300 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                }`}
                            >
                                <item.icon size={16} className="opacity-70 group-hover:opacity-100" />
                                <span className="tracking-tight">{item.label}</span>
                            </NavLink>
                        );
                    }

                    if (item.type === 'group') {
                        const isOpen = openGroups[item.label];
                        const Icon = item.icon;

                        return (
                            <div key={idx}>
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    className="w-full flex items-center justify-between gap-3 px-5 py-3 rounded-xl text-[12px] font-bold text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={16} className="opacity-70 group-hover:opacity-100" />
                                        <span className="tracking-tight">{item.label}</span>
                                    </div>
                                    {isOpen
                                        ? <ChevronDown size={14} className="text-slate-500" />
                                        : <ChevronRight size={14} className="text-slate-600" />
                                    }
                                </button>
                                {isOpen && (
                                    <div className="ml-6 pl-4 border-l border-slate-800 space-y-0.5 mt-0.5 mb-1">
                                        {item.children.map((child, ci) => (
                                            <NavLink
                                                key={ci}
                                                to={child.path}
                                                end
                                                className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-[11px] font-semibold transition-all duration-300 ${isActive || (child.matchPath && window.location.pathname === child.matchPath)
                                                    ? 'text-indigo-400 bg-indigo-500/10'
                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
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

            {/* Studio Profile */}
            <div className="mt-8 mx-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                    {user?.avatar ? (
                        <SafeImage src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-800 shadow-xl" />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/10">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-white tracking-tight leading-none truncate">{user?.name}</span>
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.15em] mt-1 opacity-80">Lead Instructor</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SideBar;
