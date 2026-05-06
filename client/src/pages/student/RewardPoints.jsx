import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { Gift, Award, Zap, History, Calendar, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

const RewardPoints = () => {
    const { backendUrl, token, user } = useContext(AppContext);
    const [stats, setStats] = useState({ totalPoints: 0, currentPoints: 0, level: 1, badges: [] });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/gamification/stats');
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error('Stats Fetch Error:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/gamification/history');
            if (data.success) setHistory(data.history);
        } catch (error) {
            console.error('History Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        const actionToast = toast.loading('Synchronizing points to currency...');
        try {
            const { data } = await api.post('/gamification/redeem', {});
            if (data.success) {
                toast.update(actionToast, { render: data.message, type: "success", isLoading: false, autoClose: 3000 });
                fetchStats();
                fetchHistory();
            } else {
                toast.update(actionToast, { render: data.message || 'Redemption failure.', type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Communication protocol error.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { 
        fetchStats(); 
        fetchHistory(); 
    }, [token]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 text-uppercase">Scholar Reward Matrix</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] opacity-80">Gamification Registry & Neural Points Ledger</p>
                </div>
                <button 
                    onClick={handleRedeem}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-emerald-600 transition-all shadow-2xl shadow-black/10 active:scale-95"
                >
                    Redeem to Wallet (500:₹1)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Points Earned', value: stats.totalPoints || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Current Point Reserve', value: stats.currentPoints || 0, icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Scholar Level', value: `Level ${stats.level || 1}`, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Badges Claimed', value: stats.badges?.length || 0, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${stat.color}`}>
                               <StatIcon size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
                                    <StatIcon size={22} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1.5">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Neural Point Ledger (Activity Stream)</h3>
                    <History size={20} className="text-slate-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</th>
                                <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Gain / Cost</th>
                                <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-12 py-20 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest italic opacity-60">Neural points matrix scanning... No recent protocols detected.</td>
                                </tr>
                            ) : (
                                history.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-12 py-8">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 uppercase tracking-widest text-[9px] font-black text-slate-400">
                                                {item.event}
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className="text-[13px] font-black text-slate-900 tracking-tight">{item.description}</span>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className={`text-[13px] font-black tracking-tight ${item.points >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {item.points >= 0 ? `+${item.points}` : item.points} PTS
                                            </span>
                                        </td>
                                        <td className="px-12 py-8 text-slate-500">
                                            <span className="text-[11px] font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
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

export default RewardPoints;




