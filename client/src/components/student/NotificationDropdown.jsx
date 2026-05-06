import React, { useEffect, useState, useContext, useRef } from 'react';
import { Bell, Check, ExternalLink, Info, Award, CreditCard, RefreshCcw } from 'lucide-react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, PlayCircle, AlertCircle } from 'lucide-react';

const NotificationDropdown = () => {
    const { backendUrl, navigate } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notification/my');
            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Neural Alert Sync Failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await api.put(`/notification/ack/${id}`, {});
            if (response.data.success) {
                if (id === 'all') {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                } else {
                    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Acknowledgement Failure:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Polling every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'ENROLLMENT_CONFIRMED': return <CreditCard className="text-emerald-500" size={16} />;
            case 'REFUND_REPLY': return <RefreshCcw className="text-amber-500" size={16} />;
            case 'ACHIEVEMENT_UNLOCKED': return <Award className="text-purple-500" size={16} />;
            case 'INSTITUTIONAL_NOTICE': return <AlertCircle className="text-blue-500" size={16} />;
            case 'ASSIGNMENT_CREATED': return <BookOpen className="text-indigo-500" size={16} />;
            case 'GRADE_POSTED': return <GraduationCap className="text-emerald-500" size={16} />;
            case 'SESSION_SCHEDULED': return <PlayCircle className="text-rose-500" size={16} />;
            default: return <Bell className="text-slate-400" size={16} />;
        }
    };

    const handleNotificationClick = (n) => {
        markAsRead(n._id);
        setIsOpen(false);
        
        if (n.actionUrl) {
            navigate(n.actionUrl);
            return;
        }

        // Fallback Logic
        if (n.module === 'ecommerce') navigate('/student/my-enrollments');
        if (n.module === 'gamification') navigate('/student/reward-points');
        if (n.module === 'academic') navigate('/student/my-courses');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
            >
                <Bell size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0C132B]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden origin-top-right"
                    >
                        <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20">
                            <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Neural Signal Hub</h3>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => markAsRead('all')}
                                    className="text-[9px] uppercase tracking-widest font-black text-indigo-500 hover:text-indigo-600 transition-colors"
                                >
                                    ACK All
                                </button>
                                <button 
                                    onClick={() => setNotifications([])}
                                    className="text-[9px] uppercase tracking-widest font-black text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                    Purge
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((n, i) => (
                                    <motion.div 
                                        key={n._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-5 border-b border-gray-50 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex gap-4 items-start ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-500/[0.03]' : 'opacity-70'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-all ${!n.isRead ? 'bg-white dark:bg-indigo-500/20 border-indigo-500/20 shadow-lg shadow-indigo-500/10' : 'bg-gray-50 dark:bg-white/5 border-transparent'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${!n.isRead ? 'text-indigo-500' : 'text-gray-400'}`}>
                                                        {n.title || 'Signal Inbound'}
                                                    </p>
                                                    <span className="text-[9px] font-bold text-gray-400/50 uppercase">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: false })}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="relative flex-shrink-0 mt-1">
                                                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md animate-pulse"></div>
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full relative z-10" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-24 px-10 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                                        <Bell size={24} className="text-gray-300 dark:text-white/20" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-white/20 font-black uppercase tracking-[0.4em]">Signal Silence</p>
                                    <p className="text-[8px] text-gray-400/50 dark:text-white/10 font-bold uppercase tracking-[0.2em] mt-2">Awaiting Neural Broadcasts</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => { setIsOpen(false); navigate('/student/notifications'); }}
                            className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500 hover:text-indigo-600 transition-all bg-gray-50/50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10"
                        >
                            Open Intelligence Log
                        </button>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;




