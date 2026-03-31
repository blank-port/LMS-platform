import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageEnrollments = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/enrollments`, getHeaders());
            if (data.success) {
                setEnrollments(data.enrollments);
            }
        } catch (error) {
            toast.error('Enrollment Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Enrollment Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Scholar Enrollment Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Curriculum Access Control & Global Student Enrollment Matrix</p>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'GROSS ENROLLMENTS', value: '2,481', trend: '+12%', color: 'text-blue-400', icon: '📝' },
                    { label: 'ACTIVE SCHOLARS', value: '1,892', trend: '+5.4', color: 'text-purple-400', icon: '👨‍🎓' },
                    { label: 'COMPLETION RATIO', value: '74.2%', trend: '+2.1%', color: 'text-green-400', icon: '🏆' },
                    { label: 'CHURN PROBABILITY', value: '4.8%', trend: '-0.3%', color: 'text-red-400', icon: '📉' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--surface)] rounded-[2rem] p-6 border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-4xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                        <h2 className={`text-2xl font-black ${stat.color} tracking-tighter mb-2`}>{stat.value}</h2>
                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">{stat.trend} VS PRIOR CYCLE</div>
                    </div>
                ))}
            </div>

            {/* Enrollment Ledger */}
            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Enrollment Ledger</h3>
                    <div className="flex gap-4">
                        <button className="text-[10px] font-black text-gray-400 hover:text-purple-400 transition-colors uppercase tracking-widest">Global Export (CSV)</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Curriculum Sector</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Access Granted</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {enrollments.map((e, idx) => (
                                <tr key={e.id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6">
                                        <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter bg-[var(--background)] px-3 py-1 rounded-full">{e.id}</span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-black text-purple-400">
                                                {e.student.charAt(0)}
                                            </div>
                                            <span className="font-black text-[var(--text-main)] text-sm tracking-tight">{e.student}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{e.course}</p>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all ${e.status === 'Enrolled' ? 'bg-blue-900/20 border-blue-100 text-blue-400' : e.status === 'Completed' ? 'bg-green-900/20 border-green-800/30 text-green-400' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{e.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {enrollments.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">📝</div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Ledger Synchronicity Void</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No enrollment records detected in the matrix.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageEnrollments;

