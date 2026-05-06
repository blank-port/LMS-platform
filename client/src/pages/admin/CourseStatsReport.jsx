import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const CourseStatsReport = () => {
    const { backendUrl } = useContext(AppContext);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/course/popularity-stats');
            if (data.success) setStats(data.stats);
        } catch (error) {
            toast.error('Curriculum Efficacy Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calculating Curriculum Efficacy...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Curriculum Performance Metrics</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Popularity Index & Academic Asset Efficacy Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stats.map((course, idx) => (
                    <div key={idx} className="bg-[var(--surface)] rounded-[3rem] border border-[var(--border)] p-8 hover:shadow-2xl hover:shadow-blue-50 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-9xl font-black pointer-events-none">{idx + 1}</div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight leading-snug h-12 line-clamp-2 uppercase">{course.courseTitle}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--background)] rounded-2xl">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Scholars</p>
                                    <p className="text-lg font-black text-blue-400 tracking-tighter">{course.enrolledCount}</p>
                                </div>
                                <div className="p-4 bg-[var(--background)] rounded-2xl">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                                    <p className="text-lg font-black text-amber-400 tracking-tighter">{course.averageRating || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Academic Efficacy</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= (course.averageRating || 0) ? 'bg-blue-600' : 'bg-[var(--background)]'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseStatsReport;




