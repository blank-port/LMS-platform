import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { Users, Copy, Share2, Award, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const Referral = () => {
    const { backendUrl, token, user } = useContext(AppContext);
    const [stats, setStats] = useState({ referralCode: '', referralCount: 0, referrals: [] });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/referrals`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (data.success) setStats(data);
        } catch (error) {
            console.error('Referral Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/register?ref=${stats.referralCode}`;
        navigator.clipboard.writeText(link);
        toast.success('Referral link synchronized to clipboard.', { position: "bottom-right" });
    };

    useEffect(() => { fetchStats(); }, [token]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 text-uppercase">Network Expansion Protocol</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] opacity-80">Referral Ecosystem & Scholar Invites</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-10">
                    {/* Referral Card */}
                    <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl shadow-blue-600/30">
                                <Share2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter mb-4 uppercase">Neural Invite Link</h2>
                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-60 mb-10">Share this protocol to expand the registry</p>
                            
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 group-hover:bg-white/10 transition-all">
                                <span className="text-xl font-black tracking-widest text-blue-400">{stats.referralCode || 'SYNCING...'}</span>
                            </div>

                            <button 
                                onClick={copyLink}
                                className="w-full py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-black/20"
                            >
                                <Copy size={14} className="inline-block mr-3" /> Sync Link
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 text-center">
                        <Users size={32} className="text-blue-600 mx-auto mb-6" />
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{stats.referralCount}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scholars Referred</p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 h-full overflow-hidden">
                        <div className="px-12 py-10 border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Scholar Registry (Direct Invites)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar Identity</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Date</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.referrals.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-10 py-20 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest italic opacity-60">Neural Expansion Pending: No direct invites detected</td>
                                        </tr>
                                    ) : (
                                        stats.referrals.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-[12px] shadow-inner uppercase tracking-tighter">
                                                            {r.name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-black text-slate-900 tracking-tight uppercase tracking-tighter">{r.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 lowercase">{r.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-slate-500">
                                                    <Calendar size={14} className="inline mr-2" />
                                                    <span className="text-[11px] font-bold">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest text-[9px] font-black">
                                                        <CheckCircle size={10} /> Active
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Referral;
