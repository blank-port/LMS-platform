import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { BookOpen, Users, TrendingUp, Award, BarChart3, Star } from 'lucide-react';

const InstructorCourseStats = () => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [courseStats, setCourseStats] = useState([]);
    const [totals, setTotals] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/instructor/course-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setCourseStats(data.courseStats);
                    setTotals(data.totals);
                }
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const overviewCards = [
        { label: 'Total Courses', value: totals.totalCourses || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Enrollments', value: totals.totalEnrollments || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Completed', value: totals.totalCompleted || 0, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Avg Progress', value: `${totals.avgOverallProgress || 0}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Education › Report</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Course Statistics</h1>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {overviewCards.map((card, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <card.icon size={22} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Course Stats Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Course Performance</h2>
                    <BarChart3 size={18} className="text-gray-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">#</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Level</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Students</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Avg Progress</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Completed</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Rating</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {courseStats.length === 0 ? (
                                <tr><td colSpan={10} className="px-6 py-16 text-center text-gray-300 font-bold text-sm">No courses to show</td></tr>
                            ) : courseStats.map((c, i) => (
                                <tr key={c._id || i} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-5 text-[10px] font-black text-gray-300">#{i + 1}</td>
                                    <td className="px-6 py-5 text-sm font-bold text-gray-900 max-w-[200px] truncate">{c.courseTitle}</td>
                                    <td className="px-6 py-5">
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{c.category}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${c.level === 'Beginner' ? 'bg-emerald-50 text-emerald-600' : c.level === 'Intermediate' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>{c.level}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${c.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : c.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>{c.status}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-black text-gray-900">{c.totalEnrollments}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${c.avgProgress}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 w-10 text-right">{c.avgProgress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-black text-gray-900">{c.completedCount}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-gray-700">{c.courseRating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right text-sm font-black text-gray-900">{currency}{c.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorCourseStats;
