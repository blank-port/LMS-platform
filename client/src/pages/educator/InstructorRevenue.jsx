import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, BookOpen } from 'lucide-react';

const InstructorRevenue = () => {
    const { currency } = useContext(AppContext);
    const [data, setData] = useState(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 100);
        const fetchRevenue = async () => {
            try {
                const { data: res } = await api.get('/instructor/revenue');
                if (res.success) setData(res);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchRevenue();
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Education › Report</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Instructor Revenue</h1>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Total Lifetime Revenue</p>
                    <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{currency}{data?.totalRevenue?.toFixed(2) || '0.00'}</h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Across {data?.courseRevenue?.length || 0} courses</p>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight">Monthly Revenue</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Last 12 months breakdown</p>
                    </div>
                    <Calendar size={20} className="text-indigo-400" />
                </div>
                <div className="h-80 w-full">
                    {hasMounted && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0} debounce={100}>
                        <BarChart data={data?.monthlyBreakdown || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={28}>
                                {data?.monthlyBreakdown?.map((_, i) => (
                                    <Cell key={i} fill={i === 11 ? '#4F46E5' : '#E0E7FF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Per-Course Revenue */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Revenue by Course</h2>
                    <BookOpen size={18} className="text-gray-300" />
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">#</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Enrollments</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(!data?.courseRevenue || data.courseRevenue.length === 0) ? (
                            <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No course revenue data</td></tr>
                        ) : data.courseRevenue.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-8 py-5 text-[10px] font-black text-gray-300">#{i + 1}</td>
                                <td className="px-8 py-5 text-sm font-bold text-gray-900 max-w-[300px] truncate">{c.courseTitle}</td>
                                <td className="px-8 py-5">
                                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">{c.enrollments}</span>
                                </td>
                                <td className="px-8 py-5 text-right text-sm font-black text-gray-900">{currency}{c.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Transactions</h2>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">#</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Description</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
                            <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No transactions yet</td></tr>
                        ) : data.recentTransactions.map((t, i) => (
                            <tr key={t._id || i} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-8 py-5 text-[10px] font-black text-gray-300">#{i + 1}</td>
                                <td className="px-8 py-5 text-sm font-black text-emerald-600">+{currency}{t.amount}</td>
                                <td className="px-8 py-5 text-xs font-medium text-gray-500">{t.description || '—'}</td>
                                <td className="px-8 py-5 text-right text-[10px] font-black text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InstructorRevenue;




