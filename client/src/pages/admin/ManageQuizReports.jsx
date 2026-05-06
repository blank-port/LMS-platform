import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageQuizReports = () => {
    const { backendUrl } = useContext(AppContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/quiz/reports/unified');
            if (data.success) {
                setReports(data.reports.map(report => ({
                    student: report.userId.name,
                    quiz: report.quizId.title,
                    score: `${report.percentage}%`,
                    date: new Date(report.createdAt).toLocaleDateString(),
                    status: report.isPassed ? 'Passed' : 'Failed'
                })));
            }
        } catch (error) {
            toast.error('Performance Analytics Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Intelligence Data...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Assessment Intelligence Insight</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Global Performance Metrics & Scholar Competency Analytics</p>
                </div>
            </div>

            {/* Analytics Suite */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'COGNITIVE AVERAGE', value: '74%', trend: '+2.4%', color: 'bg-green-900/20 text-green-400', icon: '📈' },
                    { label: 'GROSS ATTEMPTS', value: '1,248', trend: 'Stabilized', color: 'bg-blue-900/20 text-blue-400', icon: '📊' },
                    { label: 'SUCCESS QUOTIENT', value: '82.4%', trend: '-0.8%', color: 'bg-purple-900/20 text-purple-400', icon: '🎯' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--surface)] rounded-[2.5rem] p-8 border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-purple-50 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-6xl pointer-events-none group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{stat.label}</span>
                            <h2 className={`text-4xl font-black tracking-tighter ${stat.color.split(' ')[1]} mb-4`}>{stat.value}</h2>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${stat.color}`}>
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Ledger */}
            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Performance Ledger</h3>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Entity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assessment Unit</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Efficiency</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status Badge</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Synchronization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {reports.map((report, idx) => (
                                <tr key={idx} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6 font-black text-[var(--text-main)] text-sm tracking-tight">{report.student}</td>
                                    <td className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{report.quiz}</td>
                                    <td className="px-10 py-6 text-center">
                                        <span className="text-sm font-black text-purple-400 font-mono tracking-tighter">{report.score}</span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${report.status === 'Passed' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{report.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reports.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">📊</div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Intelligence Void</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No performance data synchronization detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageQuizReports;





