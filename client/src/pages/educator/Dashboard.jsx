import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import {
    ComposedChart, BarChart, Bar, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
    BookOpen, Users, Wallet, TrendingUp, Calendar, CreditCard,
    ChevronRight, ArrowUpRight, ArrowDownRight, Activity, Award, Target,
    CheckCircle
} from 'lucide-react';

const Dashboard = () => {
    const { currency, navigate } = useContext(AppContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 100);
        fetchDashboardData();
        return () => clearTimeout(timer);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/instructor/dashboard');
            if (data.success) {
                setDashboardData(data.dashboardData);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSeedData = async () => {
        try {
            const { data } = await api.get('/instructor/seed-test-data');
            if (data.success) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] instructor-theme">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-t-[var(--primary)] rounded-full animate-spin shadow-lg"></div>
            </div>
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-[var(--primary)] animate-pulse">Synchronizing Studio Intel...</p>
        </div>
    );

    const stats = [
        { label: 'Curriculum Assets', value: dashboardData?.totalCourses || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Portfolio' },
        { label: 'Active Scholars', value: dashboardData?.activeStudentsCount || 0, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: 'Engagement' },
        { label: 'Global Completion', value: `${dashboardData?.globalCompletionRate || 0}%`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Success Rate' },
        { label: 'Strategic Revenue', value: `${currency}${dashboardData?.totalRevenue?.toLocaleString() || 0}`, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Gross' },
        { label: 'Settlement Balance', value: `${currency}${dashboardData?.payoutSummary?.balance?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Available' },
        { label: 'Monthly Growth', value: `${currency}${dashboardData?.todayRevenue || 0}`, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Recent' },
    ];

    const engagementChartData = (dashboardData?.engagementInsights?.dropOffPoints || []).map((point) => ({
        name: typeof point?.title === 'string' && point.title.trim()
            ? point.title.split(' ').slice(0, 2).join(' ')
            : 'Untitled',
        exits: Number(point?.count ?? 0),
        health: Number(dashboardData?.engagementInsights?.quizPassRate ?? 0)
    }));

    return (
        <div className="panel-shell animate-fade-in instructor-theme">
            {/* Studio Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Studio Pulse</h1>
                    <p className="text-[11px] font-black text-[var(--primary)] uppercase tracking-[0.4em] opacity-80">Real-Time Performance Matrix & Academic Intelligence Terminal</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSeedData}
                        className="px-6 py-4 bg-[var(--primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95"
                    >
                        Seed Intel
                    </button>
                    <button
                        onClick={() => navigate('/educator/manage-cohorts')}
                        className="px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3"
                    >
                        <Users size={14} />
                        <span>Manage Batches</span>
                    </button>
                    <div className="px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest leading-none">Operational Status: Peak</span>
                    </div>
                </div>
            </div>

            {/* Metric Surface */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <div key={i} className="metric-tile p-8">
                            <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${stat.color}`}>
                                <StatIcon size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 border border-current opacity-60`}>
                                    <StatIcon size={20} />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.trend}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1.5">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Strategic Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Revenue Trajectory Chart */}
                <div className="panel-card rounded-[2.5rem] p-8 md:p-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2">Revenue Helix</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Cross-Monthly Fiscal Performance Comparison</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:rotate-12 duration-500 mb-2">
                                <TrendingUp size={22} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">+{currency}{dashboardData?.todayRevenue || 0} Today</span>
                        </div>
                    </div>
                    <div className="h-96 w-full">
                        {hasMounted && (
                            <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0} debounce={100}>
                            <BarChart data={dashboardData?.monthlyEarnings || []}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC' }}
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', padding: '20px' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#1E293B' }}
                                />
                                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={28}>
                                    {dashboardData?.monthlyEarnings?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fillOpacity={index === 11 ? 1 : 0.15} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Daily Engagement Matrix Chart */}
                <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-[0_40px_80px_rgba(15,23,42,0.2)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter leading-none mb-2">Engagement Spectrum</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-80">Drop-off Intensity vs Quiz Performance</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 transition-transform group-hover:scale-110 duration-500">
                            <Activity size={22} />
                        </div>
                    </div>
                    <div className="h-96 w-full relative z-10">
                        {hasMounted && (
                            <ResponsiveContainer width="100%" height="100%" minHeight={384} minWidth={0} debounce={100}>
                            <ComposedChart data={engagementChartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#475569' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '20px', color: '#fff' }}
                                />
                                <Bar dataKey="exits" fill="#3B82F6" barSize={30} radius={[5, 5, 0, 0]} />
                                <Line type="monotone" dataKey="health" stroke="#10B981" strokeWidth={3} dot={false} />
                                <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, paddingTop: '20px' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-10 flex items-center justify-between relative z-10 border-t border-white/5 pt-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">Settlement Balance</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{currency}{dashboardData?.payoutSummary?.balance?.toLocaleString() || '0.00'}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/educator/payouts')}
                            className="px-10 h-16 bg-blue-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 hover:-translate-y-1 active:scale-95 leading-none"
                        >
                            Execute Payout
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Performance Section - Phase 9 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="panel-card xl:col-span-2 rounded-[2.5rem] p-8 md:p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">Portfolio Performance</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Top performing knowledge assets by total revenue</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {dashboardData?.topPerformingCourses?.map((course, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-500/20 hover:bg-white transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-sm font-black text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        #{i+1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">{course.title}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.enrollments} Scholars Enrolled</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{currency}{course.revenue?.toLocaleString()}</span>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-80">Gross Yield</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel-card rounded-[2.5rem] p-8 md:p-10 flex flex-col">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">Engagement Delta</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80 mb-10">Critical dropout zones & learner health</p>
                    
                    <div className="flex-grow space-y-10">
                        <div>
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em] mb-6 block">Critical Drop-off Cluster</span>
                            <div className="space-y-4">
                                {dashboardData?.engagementInsights?.dropOffPoints?.map((point, i) => (
                                    <div key={i} className="relative pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-black text-slate-700 truncate max-w-[180px] leading-none uppercase">{point.title}</span>
                                            <span className="text-[11px] font-black text-rose-500">{point.count} Exits</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
                                                style={{ width: `${(point.count / (dashboardData.totalEnrollments || 1)) * 100}%`, minWidth: '4px' }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Quiz Health</span>
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <CheckCircle size={16} />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-emerald-900 tracking-tighter mb-1">{dashboardData?.engagementInsights?.quizPassRate}%</h3>
                            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Average certification pass rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Enrollment Nexus */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                <div className="px-12 py-12 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase">Enrollment Helix</h2>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Student Identities • T-Minus 72H</p>
                    </div>
                    <div className="flex items-center gap-10 bg-slate-50 border border-slate-100 p-4 rounded-[2rem]">
                        <div className="flex -space-x-4">
                            {dashboardData?.enrolledStudentsData?.slice(0, 5).map((item, i) => (
                                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[12px] font-black uppercase shadow-lg transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                    {item.student?.name?.charAt(0)}
                                </div>
                            ))}
                            {dashboardData?.enrolledStudentsData?.length > 5 && (
                                <div className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-200 flex items-center justify-center text-slate-500 text-[11px] font-black">
                                    +{dashboardData.enrolledStudentsData.length - 5}
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate('/educator/my-panel')} className="flex items-center gap-3 group px-6 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all active:scale-95">
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Full Directory</span>
                            <ChevronRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Module Index</th>
                                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Student Identity</th>
                                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Knowledge Asset</th>
                                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Fiscal Value</th>
                                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Access Stamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!dashboardData?.enrolledStudentsData || dashboardData.enrolledStudentsData.length === 0) ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center bg-slate-50/20">
                                        <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm border border-slate-100 grayscale opacity-40">🔭</div>
                                        <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Zero Ingress detected</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] max-w-xs mx-auto">Your curriculum nodes are awaiting scholar synchronization. Deploy more marketing assets to maximize yield.</p>
                                    </td>
                                </tr>
                            ) : (
                                dashboardData.enrolledStudentsData.map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/30 transition-colors group cursor-crosshair">
                                        <td className="px-12 py-10">
                                            <span className="text-[11px] font-black text-slate-300 group-hover:text-blue-600 transition-colors tracking-widest">L-ID.{index + 1001}</span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-[12px] font-black transform group-hover:rotate-6 transition-all duration-500 shadow-xl overflow-hidden">
                                                    {item.student?.avatar ? (
                                                        <img src={item.student.avatar} alt="Student" className="w-full h-full object-cover" />
                                                    ) : item.student?.name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-base font-black text-slate-900 tracking-tight leading-none">{item.student?.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">{item.student?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                <span className="text-[13px] font-black text-slate-600 tracking-tight line-clamp-1 opacity-90">{item.courseTitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-slate-900 tracking-tighter">{currency}{item.price}</span>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-80 mt-1">Status: Paid</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className="flex flex-col items-end space-y-1">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{new Date(item.enrolledDate).toLocaleDateString()}</span>
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(item.enrolledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


