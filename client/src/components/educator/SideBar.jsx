import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import SafeImage from '../common/SafeImage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, PlusCircle, BookOpen, Users, HelpCircle,
    MessageSquare, ChevronRight, Wallet, Bell,
    TrendingUp, PieChart, ShoppingBag, Settings, LogOut, Activity
} from 'lucide-react';

const menuStructure = [
    {
        type: 'link',
        path: '/educator',
        icon: BarChart3,
        label: 'Strategic Studio Dashboard 🏢',
        end: true
    },
    {
        type: 'group',
        label: 'Studio Asset Vault 💰',
        icon: ShoppingBag,
        children: [
            { path: '/educator/my-panel?tab=purchase_history', label: 'Purchase History', matchPath: '/educator/my-panel' },
            { path: '/educator/my-panel?tab=refund_cancellation', label: 'Refund & Cancellation' },
            { path: '/educator/my-panel?tab=referral', label: 'Referral Engine' },
            { path: '/educator/my-panel?tab=logged_in_device', label: 'Device Security' },
            { path: '/educator/my-panel?tab=certificates', label: 'Scholarly Credentials' },
            { path: '/educator/my-panel?tab=deposit', label: 'Fiscal Deposit' },
            { path: '/educator/my-panel?tab=topics', label: 'Subject Library' },
        ]
    },
    {
        type: 'section',
        label: 'HUMAN CAPITAL'
    },
    {
        type: 'group',
        label: 'Human Capital Management 👥',
        icon: Users,
        children: [
            { path: '/educator/payouts', label: 'Revenue Payouts' },
        ]
    },
    {
        type: 'section',
        label: 'LIVE OPERATIONS'
    },
    {
        type: 'group',
        label: 'Batch & Live Command 📡',
        icon: Activity,
        children: [
            { path: '/educator/manage-cohorts', label: 'Batch Orchestration' },
            { path: '/educator/live-sessions', label: 'Live Deployments' },
        ]
    },
    {
        type: 'section',
        label: 'CURRICULUM ENGINE'
    },
    {
        type: 'group',
        label: 'Asset Inventory & Creation 📚',
        icon: BookOpen,
        children: [
            { path: '/educator/my-courses', label: 'Asset Inventory' },
            { path: '/educator/add-course', label: 'Initialize Course' },
            { path: '/educator/course-settings', label: 'Global Settings' },
        ]
    },
    {
        type: 'group',
        label: 'Evaluation & Testing Lab 🧪',
        icon: HelpCircle,
        children: [
            { path: '/educator/question-group', label: 'Cluster Management' },
            { path: '/educator/add-question', label: 'Create Question' },
            { path: '/educator/question-bank', label: 'Question Repository' },
            { path: '/educator/question-import', label: 'Bulk Ingestion' },
            { path: '/educator/create-quiz', label: 'Module Construction' },
            { path: '/educator/manage-submissions', label: 'Strategic Submissions' },
        ]
    },
    {
        type: 'group',
        label: 'Analytical Forensics 📊',
        icon: PieChart,
        children: [
            { path: '/educator/quiz-reports', label: 'Performance Audit' },
            { path: '/educator/revenue', label: 'Revenue Analytics' },
            { path: '/educator/course-stats', label: 'Engagement Metrics' },
        ]
    },
    {
        type: 'section',
        label: 'SIGNALING HUB'
    },
    {
        type: 'link',
        path: '/educator/communication?view=notices',
        icon: Bell,
        label: 'Institutional Notices 🔔',
    },
    {
        type: 'group',
        label: 'CMS & BLOGS 📝',
        icon: MessageSquare,
        children: [
            { path: '/educator/blogs', label: 'Content Repository' },
        ]
    },
    {
        type: 'group',
        label: 'Secure Communications 📩',
        icon: MessageSquare,
        children: [
            { path: '/educator/communication', label: 'Encrypted Signaling' },
            { path: '/educator/communication?view=notices', label: 'System Notifications' },
        ]
    },
    {
        type: 'group',
        label: 'Scholar Oversight Q&A 💬',
        icon: HelpCircle,
        children: [
            { path: '/educator/qa', label: 'Thread Oversight' },
        ]
    },
    {
        type: 'link',
        path: '/student',
        icon: Users,
        label: 'Enter Student View 🎓',
    },
    {
        type: 'link',
        path: '/educator/settings',
        icon: Settings,
        label: 'Studio Config⚙️',
    },
];

const SideBar = () => {
    const { user, logout } = useContext(AppContext);
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (label) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <aside className="w-[300px] h-[calc(100vh-96px)] bg-[#0B0F1A] border-r border-white/5 hidden md:flex flex-col fixed top-24 left-0 z-40 overflow-y-auto no-scrollbar shadow-[20px_0_40px_-20px_rgba(0,0,0,0.5)]">
            <div className="p-7 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Active</span>
                </div>
            </div>

            <nav className="p-4 flex-1 space-y-1.5 pb-20 mt-4">
                {menuStructure.map((item, idx) => {
                    if (item.type === 'section') {
                        return (
                            <div key={idx} className="pt-8 pb-3 px-6">
                                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-[0.4em] opacity-60">{item.label}</span>
                            </div>
                        );
                    }

                    if (item.type === 'link') {
                        const isMain = item.path === '/educator' && item.end;
                        return (
                            <NavLink
                                key={idx}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? isMain ? 'bg-slate-800/50 text-white shadow-lg border border-white/10' : 'bg-emerald-500/10 text-emerald-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`p-2 rounded-lg transition-all duration-300 ${isActive && isMain ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : ''}`}>
                                            <item.icon size={16} strokeWidth={isMain && isActive ? 2 : 1.25} className={`transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                                        </div>
                                        <span className={`font-bold tracking-tight leading-none ${isMain ? 'text-[12px]' : 'text-[11px]'}`}>{item.label}</span>
                                        {isActive && !isMain && (
                                            <motion.div
                                                layoutId="elite-active-indicator"
                                                className="absolute right-4 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    }

                    if (item.type === 'group') {
                        const isOpen = openGroups[item.label];
                        return (
                            <div key={idx} className="space-y-1">
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    className={`w-full flex items-center justify-between gap-4 px-6 py-4 rounded-xl transition-all duration-300 group ${isOpen ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg transition-all duration-300 ${isOpen ? 'bg-slate-800 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                                            <item.icon size={16} strokeWidth={1.25} />
                                        </div>
                                        <span className={`text-[11px] font-bold tracking-tight leading-none`}>{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className={`transition-transform duration-300 opacity-40 ${isOpen ? 'rotate-90 text-emerald-500 opacity-100' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-5 pl-4 border-l border-white/5 space-y-1 mt-1 overflow-hidden"
                                        >
                                            {item.children.map((child, ci) => (
                                                <NavLink
                                                    key={ci}
                                                    to={child.path}
                                                    className={({ isActive }) => `flex items-center gap-4 px-6 py-3.5 rounded-lg text-[10.5px] font-bold tracking-tight transition-all duration-300 relative ${isActive || (child.matchPath && window.location.pathname === child.matchPath)
                                                        ? 'text-emerald-400 bg-emerald-500/5'
                                                        : 'text-slate-500 hover:text-white hover:translate-x-1'
                                                        }`}
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            {isActive && (
                                                                <div className="absolute left-[-16px] w-[1px] h-4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                            )}
                                                            {child.label}
                                                        </>
                                                    )}
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }
                    return null;
                })}
            </nav>

            {/* Studio Control Node */}
            <div className="mt-auto p-4 border-t border-white/5">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 mb-4">
                    <div className="relative">
                        {user?.avatar ? (
                            <SafeImage src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                        ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-[12px] font-black border border-white/10">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0F1A]"></span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-bold text-white truncate leading-none">{user?.name}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Lead Instructor</span>
                    </div>
                </div>

                <button onClick={logout} className="flex items-center gap-4 px-6 py-4 w-full text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 text-[10px] font-bold tracking-widest group">
                    <LogOut size={16} strokeWidth={1.5} className="opacity-60 group-hover:opacity-100" />
                    <span>TERMINATE</span>
                </button>
            </div>
        </aside>
    );
};

export default SideBar;


