import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import BadgeIcon from '../common/BadgeIcon.jsx';

const GamificationStats = () => {
    const { backendUrl, getHeaders, user } = useContext(AppContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/gamification/stats`, getHeaders());
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error('Stats synchronization failure');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!window.confirm('Convert 500 points to ₹1 wallet balance?')) return;
        setRedeeming(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/gamification/redeem`, {}, getHeaders());
            if (data.success) {
                toast.success(data.message);
                fetchStats();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Protocol failure during redemption');
        } finally {
            setRedeeming(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return null;

    return (
        <div className="space-y-6">
            {/* Level & Points Widget */}
            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-8xl font-black italic tracking-tighter group-hover:scale-110 transition-transform">LVL {stats?.level || 1}</div>
                
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">🏆</div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Knowledge Quotient</p>
                        <h2 className="text-3xl font-black tracking-tight mt-1">{stats?.totalPoints?.toLocaleString() || 0} <span className="text-sm font-bold text-gray-400 opacity-50 font-sans tracking-normal">PTS</span></h2>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Level Progression</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stats?.totalPoints % 3000} / 3000</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${(stats?.totalPoints % 3000) / 3000 * 100}%` }}
                        />
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronization:</span>
                        <span className="text-[10px] font-black text-green-400 uppercase">Optimal</span>
                    </div>
                    <button 
                        disabled={redeeming || (stats?.currentPoints < 500)}
                        onClick={handleRedeem}
                        className="px-6 py-2 bg-white/10 hover:bg-white text-indigo-900 text-[9px] font-black uppercase tracking-widest rounded-full transition-all disabled:opacity-20 hover:scale-105 active:scale-95"
                    >
                        Redeem Points
                    </button>
                </div>
            </div>

            {/* Badges Preview */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.34em]">Achievement Registry</h3>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{stats?.badges?.length || 0} Assets</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    {stats?.badges?.map((badge, i) => (
                        <div key={badge._id} className="group relative">
                            <div className="w-14 h-14 bg-[var(--background)] rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-[var(--border)] group-hover:scale-110 group-hover:rotate-6 transition-all cursor-help hover:border-indigo-200 hover:bg-indigo-50/30 overflow-hidden p-2">
                                <BadgeIcon icon={badge.icon} className="w-full h-full" />
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-gray-900 text-white rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 scale-95 group-hover:scale-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">{badge.title}</p>
                                <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase">{badge.description}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 -mt-1.5"></div>
                            </div>
                        </div>
                    ))}
                    {!stats?.badges?.length && (
                        <div className="w-full py-8 text-center border-2 border-dashed border-[var(--border)] rounded-3xl">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">No Achievements Logged</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamificationStats;
