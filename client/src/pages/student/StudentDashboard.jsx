import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GamificationStats from '../../components/student/GamificationStats.jsx';

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
        <div className="space-y-10">
            {/* Dynamic Welcome Section */}
            <div className="bg-gradient-to-br from-[#0C132B] to-[#16213e] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 uppercase text-[10px] font-black tracking-widest leading-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-4">Mastery Awaits, {user.name.split(' ')[0]}!</h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                            You've reached <span className="text-indigo-400">Level {user?.gamification?.level || 1}</span> • {user?.gamification?.totalPoints || 0} Total Intelligence Points
                        </p>
                        <div className="flex gap-4">
                            <Link to="/student/my-courses" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">Resume Learning</Link>
                            <Link to="/course-list" className="bg-white/5 hover:bg-white/10 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Browse Library</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Courses Enrolled', value: enrolledCourses.length, icon: '📖', color: 'indigo' },
                    { label: 'Completed Phases', value: completedCourses.length, icon: '🏆', color: 'emerald' },
                    { label: 'Workshops Pending', value: enrolledCourses.length - completedCourses.length, icon: '⏳', color: 'amber' },
                    { label: 'Cognitive Score', value: `${enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((acc, e) => acc + (e.progress || 0), 0) / enrolledCourses.length) : 0}%`, icon: '⚡', color: 'rose' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/40 border border-gray-50 group hover:scale-[1.02] transition-all">
                        <div className="text-3xl mb-4">{stat.icon}</div>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Gamification Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Learning Velocity Chart (Existing) */}
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50 h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Learning Velocity</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Intelligence Gain Protocol</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 900, fontSize: '10px'}}
                                    />
                                    <Area type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <GamificationStats />
                </div>
            </div>

            {/* Latest Notices / Announcements */}
            <div className="bg-[#0C132B] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                        <h3 className="text-xl font-black tracking-tight">System Directives</h3>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Real-time Instructor Pulses</p>
                    </div>
                </div>

                {notices.length === 0 ? (
                    <div className="py-10 text-center relative z-10">
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">The airwaves are currently silent.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                        {notices.slice(0, 3).map((notice, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:scale-110 transition-transform">
                                        {notice.instructor?.name?.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black border-b border-indigo-500/30 pb-0.5">{notice.instructor?.name}</span>
                                        <span className="text-[8px] font-bold text-white/30 uppercase mt-0.5">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-black tracking-tight mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">{notice.title}</h4>
                                <p className="text-[10px] font-bold text-white/50 leading-relaxed line-clamp-3">{notice.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Enrolled Courses */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Continue Learning</h2>
                    <Link to="/student/my-courses" className="text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:text-indigo-400 transition-colors">View All Courses →</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.slice(0, 3).map((enrollment, index) => {
                        const course = enrollment.courseId;
                        if (!course) return null;
                        return (
                            <div key={index} className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/40 border border-gray-50 transition-all hover:-translate-y-2">
                                <div className="aspect-video relative overflow-hidden group">
                                    <SafeImage 
                                        src={course.courseThumbnail} 
                                        alt={course.courseTitle}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        fallback="https://placehold.co/1280x720?text=Curriculum+Asset+Standby"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <button onClick={() => navigate(`/player/${course._id}`)} className="w-12 h-12 bg-white text-[#0C132B] rounded-full flex items-center justify-center shadow-2xl">▶</button>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-black text-gray-900 tracking-tight mb-4 line-clamp-1">{course.courseTitle}</h3>
                                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden mb-6">
                                        <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                    </div>
                                    <button onClick={() => navigate(`/player/${course._id}`)} className="w-full bg-[#0C132B] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Resume Lessons</button>
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
