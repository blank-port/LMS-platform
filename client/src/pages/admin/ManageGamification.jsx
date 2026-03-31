import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageGamification = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [badges, setBadges] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', description: '', criteriaType: 'course_completion', criteriaValue: 1 });

    const fetchBadges = async () => {
        try {
            // Placeholder for badges fetch
            setBadges([
                { id: 1, title: 'Course Starter', description: 'Enrolled in first curriculum unit', criteria: 'Enrollment x1', icon: '🎯' },
                { id: 2, title: 'Quiz Master', description: 'Academic excellence (100% result)', criteria: 'Perfect Score', icon: '🔥' },
                { id: 3, title: 'Early Professional', description: 'Exceptional completion velocity', criteria: 'Velocity 24h', icon: '🕊️' },
            ]);
        } catch (error) {
            toast.error('Achievement Matrix Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Initializing Incentivization Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Cognitive Incentivization Matrix</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Achievement Orchestration & Behavioral Protocol Management</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)} 
                    className="h-14 px-10 bg-yellow-400 text-[var(--text-main)] text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-yellow-500 hover:shadow-2xl hover:shadow-yellow-100 transition-all flex items-center gap-4 group"
                >
                    <span className="text-lg group-hover:scale-125 transition-transform">+</span>
                    Design Achievement
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'GROSS ACHIEVEMENTS', value: '14,290', trend: '+18% Sync', color: 'text-yellow-600' },
                    { label: 'ACTIVE PROTOCOLS', value: '24 Units', trend: 'Global Reach', color: 'text-[var(--text-main)]' },
                    { label: 'BEHAVIORAL RATIO', value: '82.4%', trend: 'Optimum', color: 'text-green-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] text-6xl italic font-serif">A</div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                        <h2 className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h2>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-4 italic">{stat.trend}</p>
                    </div>
                ))}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {badges.map(badge => (
                    <div key={badge.id} className="bg-[var(--surface)] p-10 rounded-[4rem] border border-[var(--border)] shadow-sm flex flex-col items-center text-center group transition-all hover:shadow-2xl hover:shadow-yellow-50 hover:-translate-y-2">
                        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-5xl mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all shadow-inner border border-yellow-100 relative">
                            <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/5 group-hover:animate-none"></div>
                            {badge.icon}
                        </div>
                        <h3 className="font-black text-[var(--text-main)] text-lg tracking-tight mb-2 capitalize">{badge.title}</h3>
                        <p className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-wider h-10 overflow-hidden">{badge.description}</p>
                        <div className="w-full pt-6 border-t border-[var(--border)]">
                            <span className="inline-block text-[9px] font-black text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full uppercase tracking-widest border border-yellow-100">
                                {badge.criteria}
                            </span>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => setShowAddModal(true)}
                    className="group border-4 border-dashed border-[var(--border)] p-10 rounded-[4rem] flex flex-col items-center justify-center gap-6 hover:border-yellow-200 hover:bg-yellow-50/20 transition-all"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--background)] group-hover:bg-[var(--surface)] flex items-center justify-center text-2xl text-gray-300 group-hover:text-yellow-500 transition-all">
                        +
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] group-hover:text-yellow-600 transition-colors">Manifest Protocol</span>
                </button>
            </div>
        </div>
    );
};

export default ManageGamification;

