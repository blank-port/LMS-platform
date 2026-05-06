import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageReferrals = () => {
    const { backendUrl } = useContext(AppContext);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReferrals = async () => {
        try {
            const { data } = await api.get(`/marketing/referrals`);
            if (data.success) setReferrals(data.referrals);
        } catch (error) {
            toast.error('Referral Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReferrals(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Viral Growth Nodes...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Referral Matrix Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Affiliate Performance & Organic Growth Intelligence</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Referral Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referrer</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referred Scholar</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reward Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Synchronization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {referrals.map(ref => (
                                <tr key={ref._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6 font-black text-[var(--text-main)] text-sm">{ref.referrer?.name}</td>
                                    <td className="px-10 py-6 text-xs font-bold text-gray-500">{ref.referred?.name}</td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${ref.status === 'rewarded' ? 'bg-green-900/20 border-green-800/30 text-green-400' : 'bg-amber-900/20 border-amber-800/30 text-amber-400'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(ref.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {referrals.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">🔗</div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Viral Void</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No referral synchronization detected in the matrix.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReferrals;





