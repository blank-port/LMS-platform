import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContextObject';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationBell = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/payment/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling for updates (can be replaced by Pusher)
        const interval = setInterval(fetchNotifications, 30000); // 30s
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const { data } = await axios.patch(`${backendUrl}/api/payment/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        setIsOpen(false);

        // Routing Logic
        switch (notification.type) {
            case 'NEW_COD_REQUEST':
                navigate('/admin/cod-approvals');
                break;
            case 'NEW_USER':
                navigate('/admin/users');
                break;
            case 'NEW_QUESTION':
                navigate('/admin/qa');
                break;
            case 'NEW_PAYMENT':
                navigate('/admin/payments');
                break;
            default:
                break;
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'NEW_COD_REQUEST': return '💳';
            case 'NEW_USER': return '👤';
            case 'NEW_QUESTION': return '❓';
            case 'REWARD_REDEMPTION': return '🏅';
            default: return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white hover:bg-indigo-50 border border-slate-200 rounded-2xl transition-all duration-300 group shadow-sm active:scale-95"
            >
                <span className="text-xl group-hover:rotate-12 transition-transform block">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100/50 z-[60] overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Strategy Alerts</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Real-time Intel Feed</p>
                            </div>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-indigo-600">
                                {unreadCount} UNREAD
                            </span>
                        </div>

                        <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div 
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`px-6 py-4 flex gap-4 cursor-pointer hover:bg-indigo-50/30 transition-colors ${!n.isRead ? 'bg-indigo-50/20 shadow-inner' : ''}`}
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-black text-slate-900' : 'text-slate-500'}`}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                    n.module === 'ecommerce' ? 'bg-green-100 text-green-700' :
                                                    n.module === 'users' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {n.module}
                                                </span>
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-20 text-center text-slate-400 italic text-sm">
                                    Strategic communications clear.
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                            <button 
                                onClick={fetchNotifications}
                                className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors"
                            >
                                Force Intel Sync
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
