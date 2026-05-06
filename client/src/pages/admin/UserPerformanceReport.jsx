import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const UserPerformanceReport = () => {
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPerformance = async () => {
        try {
            const { data } = await api.get('/admin/scholar-performance');
            if (data.success) setPerformance(data.performance);
        } catch (error) {
            toast.error('Performance Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPerformance(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-green-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Mastery Data Points...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Global Scholar Mastery Ledger</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Academic Progress Monitoring & Competency Efficacy Matrix</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="px-10 py-8 border-b border-[var(--border)]">
                        <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Performance Ledger</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--background)]/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Curriculum Saturation</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Assessment Mastery</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Mastery Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {performance.map((user, idx) => (
                                    <tr key={idx} className="group hover:bg-[var(--background)]/30 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center text-green-400 font-black text-xs">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <span className="font-black text-[var(--text-main)] text-sm tracking-tight">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="w-full bg-[var(--background)] h-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${user.completion}%` }}></div>
                                            </div>
                                            <p className="text-[8px] font-black text-gray-400 mt-2 uppercase text-center">{user.completion}% PROGRESS</p>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-sm font-black text-[var(--text-main)]">{user.avgScore}%</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.avgScore >= 90 ? 'bg-green-900/20 text-green-400' : user.avgScore >= 75 ? 'bg-blue-900/20 text-blue-400' : 'bg-amber-900/20 text-amber-400'}`}>
                                                Grade {user.avgScore >= 90 ? 'A+' : user.avgScore >= 80 ? 'A' : 'B'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPerformanceReport;




