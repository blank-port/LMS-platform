import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GamificationStats from '../../components/student/GamificationStats.jsx';
import { BookOpen, Award, Clock, Zap, Activity, MessageSquare, ChevronRight, Wallet, CreditCard } from 'lucide-react';
import SafeImage from '../../components/student/SafeImage.jsx';

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
    const { user, enrolledCourses, backendUrl, token, navigate } = useContext(AppContext);
    const [notices, setNotices] = useState([]);

    const fetchNotices = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/notices`, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) setNotices(data.notices);
        } catch (error) {
            console.error('Error fetching notices:', error);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        if (token) fetchNotices();
    }, [token]);

    if (!user) return null;

    const completedCourses = enrolledCourses.filter(e => e.progress === 100);

    return (
        <div className="space-y-12 student-theme pb-20">
            {/* Immersive Welcome Engine */}
            <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 bg-cyan-50 border border-cyan-100 px-5 py-2.5 rounded-2xl mb-8">
                            <Zap size={14} className="text-cyan-500" />
                            <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em]">Synapse Active</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                            Welcome Back, <span className="text-blue-600">{user.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mb-10 opacity-70">
                            Neural Sync: <span className="text-blue-600">Level {user?.gamification?.level || 1}</span> • Total XP: {user?.gamification?.totalPoints || 0}
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <button 
                                onClick={() => navigate('/student/my-courses')}
                                className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
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
                    <div className="hidden lg:block w-72 h-72 bg-gradient-to-br from-blue-50 to-white rounded-[4rem] border border-slate-100 shadow-inner flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-1000">
                         <div className="text-7xl font-black text-blue-600 opacity-20">L.{user?.gamification?.level || 1}</div>
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
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
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

            {/* Intelligence Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 h-full group">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2 text-uppercase">Learning Velocity</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Neuro-Engagement Protocol (7D)</p>
                            </div>
                            <Activity size={24} className="text-blue-600 animate-pulse" />
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94A3B8'}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94A3B8'}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', padding: '20px'}}
                                        itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#1E293B' }}
                                    />
                                    <Area type="monotone" dataKey="xp" stroke="#3B82F6" strokeWidth={5} fillOpacity={1} fill="url(#colorXp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <GamificationStats />
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
                    <button 
                        onClick={() => navigate('/student/my-courses')}
                        className="flex items-center gap-3 group px-8 py-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 transition-all active:scale-95"
                    >
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Full Library</span>
                        <ChevronRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {enrolledCourses.slice(0, 3).map((enrollment, index) => {
                        const course = enrollment.courseId;
                        if (!course) return null;
                        return (
                            <div key={index} className="bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40 transition-all duration-700 hover:-translate-y-4 group">
                                <div className="aspect-video relative overflow-hidden">
                                    <SafeImage 
                                        src={course.courseThumbnail} 
                                        alt={course.courseTitle}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        fallback="https://placehold.co/1280x720?text=Curriculum+Asset+Standby"
                                    />
                                    <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center backdrop-blur-sm">
                                        <button onClick={() => navigate(`/player/${course._id}`)} className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-700">
                                            <Zap size={24} fill="currentColor" />
                                        </button>
                                    </div>
                                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-xl">
                                        {enrollment.progress || 0}% SYNC
                                    </div>
                                </div>
                                <div className="p-10 space-y-8 text-center">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1 uppercase tracking-tighter">{course.courseTitle}</h3>
                                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden relative border border-slate-100">
                                        <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-1000 shadow-lg" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/player/${course._id}`)}
                                        className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all duration-500 shadow-2xl"
                                    >
                                        Synchronize Knowledge
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
