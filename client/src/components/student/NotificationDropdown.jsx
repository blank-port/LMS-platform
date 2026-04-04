import React, { useEffect, useState, useContext, useRef } from 'react';
import { Bell, Check, ExternalLink, Info, Award, CreditCard, RefreshCcw } from 'lucide-react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
    const { backendUrl, getHeaders, navigate } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/notification/my`, getHeaders());
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
            const response = await axios.put(`${backendUrl}/api/notification/ack/${id}`, {}, getHeaders());
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
            case 'INSTITUTIONAL_NOTICE': return <Info className="text-blue-500" size={16} />;
            default: return <Bell className="text-indigo-500" size={16} />;
        }
    };

    const handleNotificationClick = (n) => {
        markAsRead(n._id);
        setIsOpen(false);
        // Logic for navigation based on module
        if (n.module === 'ecommerce') navigate('/student/my-enrollments');
        if (n.module === 'gamification') navigate('/student/reward-points');
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
                        <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Neural Alerts</h3>
                            <button 
                                onClick={() => markAsRead('all')}
                                className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div 
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 border-b border-gray-50 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex gap-3 ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-white dark:bg-white/10 shadow-sm' : 'bg-gray-100 dark:bg-white/5 opacity-50'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {n.message}
                                            </p>
                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {!n.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center">
                                    <Bell size={32} className="mx-auto text-gray-300 dark:text-white/10 mb-3" />
                                    <p className="text-xs text-gray-500 dark:text-white/30 font-medium uppercase tracking-widest">Awaiting strategic signals...</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => { setIsOpen(false); navigate('/student/notifications'); }}
                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] dark:text-white/40 hover:text-indigo-500 transition-colors bg-gray-50/50 dark:bg-black/20"
                        >
                            View Efficiency Log
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
