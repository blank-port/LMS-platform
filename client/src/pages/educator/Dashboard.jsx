import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  BookOpen, Users, Wallet, TrendingUp, Calendar, CreditCard, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';

const Dashboard = () => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const { data } = await axios.get(`${backendUrl}/api/instructor/seed-test-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50/50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/40 text-center">Synthesizing Financial Intel...</p>
        </div>
    );

    const stats = [
        { label: 'Subjects Taught', value: dashboardData?.totalSubjects || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Students', value: dashboardData?.totalEnrollments || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Enrolled Amount', value: `${currency}${dashboardData?.todayEnrolledAmount || 0}`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Today\'s Gross' },
        { label: 'Total Revenue', value: `${currency}${dashboardData?.totalRevenue || 0}`, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Earnings Today', value: `${currency}${dashboardData?.todayRevenue || 0}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'This Month', value: `${currency}${dashboardData?.thisMonthRevenue || 0}`, icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="p-6 md:p-10 space-y-10 bg-gray-50/40 min-h-screen font-inter">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Instructor Hub <span className="text-indigo-600">.</span></h1>
                    <p className="text-sm font-medium text-gray-400">Welcome back! Here's your performance snapshot and real-time pulse.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSeedData} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Seed Test Data</button>
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Operational Status: Peak</span>
                    </div>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={22} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                        {stat.sub && <p className="text-[8px] font-bold text-gray-400 mt-1">{stat.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Monthly Income Stats Chart */}
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Revenue Trajectory</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Monthly Earnings Comparison</p>
                        </div>
                        <TrendingUp size={20} className="text-indigo-500" />
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData?.monthlyEarnings || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={24}>
                                    {dashboardData?.monthlyEarnings?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 11 ? '#4F46E5' : '#E0E7FF'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Statistics Progress Area Chart */}
                <div className="bg-[#0C132B] p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight">Daily Performance</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Current Month Statistics</p>
                        </div>
                        <Activity size={20} className="text-indigo-400" />
                    </div>
                    <div className="h-80 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData?.paymentStatistics || []}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" hide />
                                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                <Area type="monotone" dataKey="amount" stroke="#818CF8" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="text-left">
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Total Payouts</p>
                                <p className="text-xl font-black text-white">{currency}0.00</p>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">Request Funds</button>
                    </div>
                </div>
            </div>

            {/* Recent Table Section */}
            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-10 py-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Enrollments</h2>
                        <p className="text-xs font-semibold text-gray-400 mt-1">New students verified in the last 72 hours</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {dashboardData?.enrolledStudentsData?.slice(0, 4).map((item, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black uppercase ring-1 ring-gray-100">
                                    {item.student?.name?.charAt(0)}
                                </div>
                            ))}
                            {dashboardData?.enrolledStudentsData?.length > 4 && (
                                <div className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-black">
                                    +{dashboardData.enrolledStudentsData.length - 4}
                                </div>
                            )}
                        </div>
                        <button className="flex items-center gap-2 group">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:mr-2 transition-all">View All</span>
                            <ChevronRight size={14} className="text-indigo-600" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Intel ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity Matrix</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Course Module</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gross Price</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Access Key Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dashboardData?.enrolledStudentsData?.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] font-black text-gray-300 group-hover:text-indigo-600 transition-colors">#{index + 101}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {item.student?.name?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 leading-none mb-1">{item.student?.name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[120px]">{item.student?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            <span className="text-xs font-bold text-gray-600 tracking-tight line-clamp-1">{item.courseTitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-sm font-black text-gray-900 tracking-tighter">{currency}{item.price}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(item.enrolledDate).toLocaleDateString()}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{new Date(item.enrolledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
