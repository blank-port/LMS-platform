import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import api from '@/utils/api';
import { AppContext } from '../../context/AppContextObject';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BellIcon,
    CheckBadgeIcon,
    CheckCircleIcon,
    CreditCardIcon,
    ArrowTopRightOnSquareIcon,
    QuestionMarkCircleIcon,
    SparklesIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';

const routeByType = {
    COD_ORDER: '/admin/cod-approvals',
    NEW_USER: '/admin/users',
    NEW_QUESTION: '/admin/qa',
    COURSE_REQUEST: '/admin/courses',
    REWARD_REDEMPTION: '/admin/gamification-history',
    PAYMENT_SUCCESS: '/admin/payments',
    PAYMENT_FAILURE: '/admin/payments'
};

const moduleColorClasses = {
    ecommerce: 'bg-emerald-500/10 text-emerald-600',
    users: 'bg-sky-500/10 text-sky-600',
    communication: 'bg-fuchsia-500/10 text-fuchsia-600',
    academic: 'bg-indigo-500/10 text-indigo-600',
    gamification: 'bg-amber-500/10 text-amber-600',
    system: 'bg-slate-500/10 text-slate-600'
};

const getNotificationVisual = (notification) => {
    switch (notification.type) {
        case 'COD_ORDER':
        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_FAILURE':
            return {
                icon: CreditCardIcon,
                iconClass: 'text-emerald-600',
                backgroundClass: 'bg-emerald-500/10'
            };
        case 'NEW_USER':
            return {
                icon: UserPlusIcon,
                iconClass: 'text-sky-600',
                backgroundClass: 'bg-sky-500/10'
            };
        case 'NEW_QUESTION':
            return {
                icon: QuestionMarkCircleIcon,
                iconClass: 'text-indigo-600',
                backgroundClass: 'bg-indigo-500/10'
            };
        case 'REWARD_REDEMPTION':
            return {
                icon: SparklesIcon,
                iconClass: 'text-amber-600',
                backgroundClass: 'bg-amber-500/10'
            };
        case 'INSTITUTIONAL_NOTICE':
            return {
                icon: CheckBadgeIcon,
                iconClass: 'text-fuchsia-600',
                backgroundClass: 'bg-fuchsia-500/10'
            };
        default:
            return {
                icon: BellIcon,
                iconClass: 'text-slate-600',
                backgroundClass: 'bg-slate-500/10'
            };
    }
};

const formatRelativeTime = (value) => {
    if (!value) return 'Just now';
    const createdAt = new Date(value);
    const diffMs = Date.now() - createdAt.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotificationBell = () => {
    const { token } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const { data } = await api.get('/notification/my');
            if (data.success) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch admin notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const { data } = await api.put(`/notification/ack/${id}`, {});
            if (data.success) {
                if (id === 'all') {
                    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
                    setUnreadCount(0);
                } else {
                    setNotifications((prev) =>
                        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
                    );
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to acknowledge notification', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        setIsOpen(false);

        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            return;
        }

        const fallbackRoute = routeByType[notification.type];
        if (fallbackRoute) navigate(fallbackRoute);
    };

    const unreadNotifications = useMemo(
        () => notifications.filter((notification) => !notification.isRead).length,
        [notifications]
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group relative rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50/40 active:scale-95"
                aria-label="Open admin notifications"
            >
                <BellIcon className="h-6 w-6 text-slate-600 transition-transform duration-300 group-hover:rotate-6 group-hover:text-emerald-600" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 z-[80] mt-4 w-[400px] overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]"
                    >
                        <div className="border-b border-slate-100 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 px-4 py-3.5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-[15px] font-black tracking-tight text-slate-900">Admin Notifications</h3>
                                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Operations and alerts
                                    </p>
                                </div>
                                <div className="rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600 shadow-sm">
                                    {unreadCount} unread
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white/90 px-3 py-2.5 shadow-sm">
                                <div className="text-[10px] font-semibold leading-snug text-slate-500">
                                    <span className="font-black text-slate-900">{notifications.length}</span> total
                                    <span className="mx-1.5 text-slate-300">•</span>
                                    <span className="font-black text-emerald-600">{unreadNotifications}</span> pending
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => markAsRead('all')}
                                        disabled={unreadCount === 0}
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Mark all
                                    </button>
                                    <button
                                        type="button"
                                        onClick={fetchNotifications}
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto bg-slate-50/30 p-3 custom-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="px-6 py-16 text-center text-sm font-semibold text-slate-400">
                                    Loading notifications...
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => {
                                    const visual = getNotificationVisual(notification);
                                    const Icon = visual.icon;
                                    const moduleClass = moduleColorClasses[notification.module] || moduleColorClasses.system;

                                    return (
                                        <button
                                            key={notification._id}
                                            type="button"
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`mb-2 flex w-full items-start gap-2.5 rounded-[1rem] border px-2.5 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                                !notification.isRead
                                                    ? 'border-emerald-100 bg-white ring-1 ring-emerald-100/70'
                                                    : 'border-slate-100 bg-white/92'
                                            }`}
                                        >
                                            <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${visual.backgroundClass}`}>
                                                <Icon className={`h-4.5 w-4.5 ${visual.iconClass}`} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[11px] font-black leading-tight text-slate-900">
                                                            {notification.title || 'Admin alert'}
                                                        </p>
                                                        <p className={`mt-1 line-clamp-2 text-[11px] leading-relaxed ${!notification.isRead ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    {!notification.isRead && (
                                                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                                                    )}
                                                </div>

                                                <div className="mt-2 flex items-center justify-between gap-2">
                                                    <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${moduleClass}`}>
                                                        {notification.module || 'system'}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                        {formatRelativeTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-14 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                        <CheckCircleIcon className="h-8 w-8" />
                                    </div>
                                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">
                                        All clear
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-slate-500">
                                        No admin notifications are waiting right now.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 bg-white px-4 py-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/admin/push-notifications');
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700"
                            >
                                Open notification center
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
