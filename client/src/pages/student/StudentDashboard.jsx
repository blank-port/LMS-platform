import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Link } from 'react-router-dom';
import api from '@/utils/api';
import { assets } from '../../assets/assets';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GamificationStats from '../../components/student/GamificationStats.jsx';
import { BookOpen, Award, Clock, Zap, Activity, MessageSquare, ChevronRight, Wallet, CreditCard, Users, Video, Play, Mic } from 'lucide-react';
import SafeImage from '../../components/student/SafeImage.jsx';
import LiveSessionWidget from '../../components/student/LiveSessionWidget.jsx';
import StudyPlanner from '../../components/student/StudyPlanner.jsx';

const data = [
    { name: 'Mon', xp: 400 },
    { name: 'Tue', xp: 300 },
    { name: 'Wed', xp: 600 },
    { name: 'Thu', xp: 800 },
    { name: 'Fri', xp: 500 },
    { name: 'Sat', xp: 900 },
    { name: 'Sun', xp: 1200 },
];

const StudentDashboard = () => {
    const { user, enrolledCourses, token, navigate } = useContext(AppContext);
    const [notices, setNotices] = useState([]);
    const [hasMounted, setHasMounted] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(false);
    const [cohorts, setCohorts] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const fetchDashboardIntegrations = async () => {
        try {
            // Fetch Assignments
            const assignRes = await api.get('/assignment/student-submissions');
            if (assignRes.data.success) {
                // Filter for ungraded or pending ones
                setAssignments(assignRes.data.submissions || []);
            }

            // Fetch Notification Count
            const notifRes = await api.get('/notification/my');
            if (notifRes.data.success) {
                setUnreadNotifications(notifRes.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Intelligence sync failure:', error);
        }
    };

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/comm/notices');
            if (data.success) setNotices(data.notices);
        } catch (error) {
            console.error('Error fetching notices:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 100);
        window.scrollTo(0, 0);
        if (token) {
            fetchNotices();
            fetchRecommendations();
            fetchCohorts();
            fetchDashboardIntegrations();
        }
        return () => clearTimeout(timer);
    }, [token]);

    const fetchCohorts = async () => {
        try {
            const { data } = await api.get('/cohort/student-list');
            if (data.success) setCohorts(data.cohorts);
        } catch (error) {
            console.error('Error fetching cohorts:', error);
        }
    };

    const fetchRecommendations = async () => {
        setRecLoading(true);
        try {
            const interests = enrolledCourses.map(e => e.courseId?.category?.name).filter(Boolean).join(',');
            const { data } = await api.get(`/ai/recommendations?interests=${encodeURIComponent(interests || 'Technology, Education')}`);
            if (data.success) {
                const courses = data.data?.recommendedCourses || data.recommendedCourses || [];
                setRecommendations(courses);
            }
        } catch (error) {
            // Silently degrade — the UI already shows a "generating" state
        } finally {
            setRecLoading(false);
        }
    };

    if (!user) return null;

    const completedCourses = enrolledCourses.filter(e => e.progress === 100);

    return (
        <div className="panel-shell student-theme">
            {/* Immersive Welcome Engine */}
            <div className="panel-card relative overflow-hidden rounded-[2.5rem] p-8 md:p-12">
                <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-[var(--accent)]/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 bg-[var(--background)] border border-[var(--border)] px-5 py-2.5 rounded-2xl mb-8">
                            <Zap size={14} className="text-[var(--primary)]" />
                            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em]">Synapse Active</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                            Welcome Back, <span className="text-[var(--primary)]">{user.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mb-10 opacity-70">
                            Neural Sync: <span className="text-[var(--primary)]">Level {user?.gamification?.level || 1}</span> • Total XP: {user?.gamification?.totalPoints || 0}
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <button
                                onClick={() => navigate('/student/my-courses')}
                                className="px-10 py-4 bg-[var(--primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95"
                            >
                                Resume Matrix
                            </button>
                            <button
                                onClick={() => navigate('/course-list')}
                                className="px-10 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Browse Academy
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block w-72 h-72 bg-gradient-to-br from-emerald-50 to-white rounded-[4rem] border border-slate-100 shadow-inner flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-1000">
                        <div className="text-7xl font-black text-[var(--primary)] opacity-20">L.{user?.gamification?.level || 1}</div>
                    </div>
                </div>
            </div>

            {/* Cognitive Stats Grid - InfixLMS Parity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Wallet Balance', value: `₹${user.walletBalance || 0}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Institutional Spend', value: `₹${enrolledCourses.length * 499}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Certified Assets', value: user.certificates?.length || 0, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Active Knowledge', value: enrolledCourses.length, icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' }
                ].map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <div key={i} className="metric-tile rounded-[2rem] p-8">
                            <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${stat.color}`}>
                                <StatIcon size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
                                    <StatIcon size={22} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1.5">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Intelligence Directives - Academic Deadlines & Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Live Session Intelligence */}
                <div className="bg-white/40 backdrop-blur-xl border border-rose-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <Video size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Broadcasts</h4>
                                <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest">Live Learning Events</p>
                            </div>
                        </div>
                        <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest animate-pulse">Live Now</span>
                    </div>
                    <LiveSessionWidget />
                </div>

                {/* Assignment Deadlines Intelligence */}
                <div className="bg-white/40 backdrop-blur-xl border border-indigo-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <BookOpen size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Academic Milestones</h4>
                                <p className="text-[9px] font-bold text-indigo-500/60 uppercase tracking-widest">Pending Assessments</p>
                            </div>
                        </div>
                        {unreadNotifications > 0 && (
                            <div className="bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                                {unreadNotifications} New Alerts
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {assignments.length > 0 ? (
                            assignments.filter(a => a.status !== 'graded').slice(0, 2).map((a, i) => (
                                <div key={i} className="p-4 bg-white/60 border border-indigo-500/10 rounded-2xl flex items-center justify-between group/item hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight line-clamp-1">{a.assignmentId?.title || 'Course Assessment'}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status: {a.status || 'Pending'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">All assignments synchronized</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <StudyPlanner />

            {/* Intelligence Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="panel-card h-full rounded-[2.5rem] p-8 md:p-10">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2 text-uppercase">Learning Velocity</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Neuro-Engagement Protocol (7D)</p>
                            </div>
                            <Activity size={24} className="text-[var(--primary)]" />
                        </div>
                        <div className="h-80 w-full" style={{ minHeight: '320px' }}>
                            {hasMounted && (
                                <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', padding: '20px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#1E293B' }}
                                    />
                                    <Area type="monotone" dataKey="xp" stroke="#0f766e" strokeWidth={5} fillOpacity={1} fill="url(#colorXp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <GamificationStats />
                </div>
            </div>

            {/* Synchronized Learning Layer - Phase 13 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="panel-card rounded-[2.5rem] p-8 md:p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">My Batches</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Active Learning Cohorts</p>
                        </div>
                        <Users size={24} className="text-emerald-500" />
                    </div>
                    {cohorts.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                             <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">No active cohorts detected</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cohorts.map((cohort, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-white border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer group/batch" onClick={() => navigate(`/student/cohort/${cohort._id}`)}>
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                                            {cohort.cohortName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase text-xs tracking-tight group-hover/batch:text-emerald-600 transition-colors">{cohort.cohortName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{cohort.courseId?.courseTitle}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover/batch:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-[4rem] p-12 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter leading-none mb-2 uppercase">Broadcast Node</h3>
                            <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest opacity-80">Synchronized Media Streams</p>
                        </div>
                        <Video size={24} className="text-rose-500 animate-pulse" />
                    </div>
                    <div className="relative z-10">
                        <LiveSessionWidget />
                    </div>
                </div>
            </div>

            {/* Strategic Directives */}
            <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-[0_40px_80px_rgba(15,23,42,0.2)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none mb-2 uppercase">Neural Comms</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-2">Latest Directives from Mentors</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <MessageSquare size={22} />
                    </div>
                </div>

                {notices.length === 0 ? (
                    <div className="py-16 text-center relative z-10 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Subspace channels are silent</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                        {notices.slice(0, 3).map((notice, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all duration-500 group/item cursor-pointer">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-[12px] font-black text-white shadow-lg">
                                        {notice.instructor?.name?.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-white/90 border-b border-blue-500/20 mb-1">{notice.instructor?.name}</span>
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black tracking-tight mb-3 line-clamp-1 group-hover/item:text-blue-400 transition-colors">{notice.title}</h4>
                                <p className="text-[11px] font-bold text-white/50 leading-relaxed line-clamp-3 opacity-60">{notice.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Knowledge Matrix - Enrolled Assets */}
            <div className="space-y-10">
                <div className="flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none text-uppercase">Continue Matrix</h2>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60">Your Active Intelligence Streams</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {enrolledCourses.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-white/40 backdrop-blur-xl border border-dashed border-slate-200 rounded-[3rem]">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Zero ingress detected. Start your first curriculum sync.</p>
                            <button onClick={() => navigate('/course-list')} className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em]">Browse Academy</button>
                        </div>
                    ) : (
                        [...enrolledCourses]
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        .slice(0, 3)
                        .map((enrollment, index) => {
                            const course = enrollment.courseId;
                            if (!course) return null;

                            const flatLectures = course.courseContent?.flatMap(ch => ch.chapterContent) || [];
                            const lastIndex = flatLectures.findIndex(l => l._id === enrollment.lastWatchedLessonId);
                            const nextLesson = lastIndex !== -1 && lastIndex < flatLectures.length - 1 
                                ? flatLectures[lastIndex + 1] 
                                : flatLectures[0];

                            return (
                                <div key={index} className="panel-card overflow-hidden rounded-[2.5rem] transition-all duration-700 hover:-translate-y-2 group">
                                    <div className="aspect-video relative overflow-hidden">
                                        <SafeImage
                                            src={course.courseThumbnail}
                                            alt={course.courseTitle}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            fallback="https://placehold.co/1280x720?text=Curriculum+Asset+Standby"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center backdrop-blur-sm">
                                            <button onClick={() => navigate(`/student/player/${course._id}`)} className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-700">
                                                <Zap size={24} fill="currentColor" />
                                            </button>
                                        </div>
                                        <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-xl">
                                            {enrollment.progress || 0}% SYNC
                                        </div>
                                    </div>
                                    <div className="p-10 space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1 uppercase tracking-tighter">{course.courseTitle}</h3>
                                        
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Next Directive</p>
                                            <div className="flex items-center gap-3">
                                                <Play size={14} className="text-blue-500 flex-shrink-0" />
                                                <p className="text-[11px] font-bold text-slate-600 line-clamp-1 uppercase tracking-tight">
                                                    {nextLesson?.lectureTitle || 'Initiating Sequence...'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden relative border border-slate-100">
                                            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-1000 shadow-lg" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => navigate(`/student/player/${course._id}`)}
                                                className="flex-1 h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all duration-500 shadow-xl"
                                            >
                                                Resume
                                            </button>
                                            <button
                                                onClick={() => navigate(`/student/mock-interview/${course._id}`)}
                                                className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-500 shadow-xl group/viva"
                                                title="Start AI Mock Interview"
                                            >
                                                <Mic size={18} className="group-hover/viva:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="space-y-10">
                <div className="flex items-center justify-between px-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                             <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">Neural Recommendation Engine</p>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none text-uppercase">AI Recommended for You</h2>
                    </div>
                    {recLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommendations.length === 0 && !recLoading ? (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Generating personalized pathways...</p>
                        </div>
                    ) : (
                        recommendations.map((course, i) => (
                            <div key={i} className="panel-card p-6 rounded-[2rem] hover:scale-[1.02] transition-all group cursor-pointer" onClick={() => navigate(`/course/${course._id}`)}>
                                <div className="aspect-video bg-slate-100 rounded-[1.5rem] overflow-hidden mb-6 relative">
                                    <SafeImage src={course.courseThumbnail} alt={course.courseTitle} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase">{95 + (i % 5)}% Match</div>

                                </div>
                                <h4 className="text-sm font-black text-slate-900 tracking-tight line-clamp-1 uppercase mb-2">{course.courseTitle}</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.category?.name}</span>
                                    <ChevronRight size={14} className="text-emerald-500" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;


