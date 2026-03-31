import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const GamificationHistory = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/gamification/history`, getHeaders());
            if (data.success) setHistory(data.history);
        } catch (error) {
            toast.error('Achievement Ledger Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Achievement Streams...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Achievement History Ledger</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Institutional Recognition Logs & Scholar Milestone Tracking</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Recognition Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Entity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Recognition Token</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descriptor</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Synchronization Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {history.map(item => (
                                <tr key={item._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-[10px] font-black text-gray-400">
                                                {item.student?.name?.charAt(0)}
                                            </div>
                                            <span className="font-black text-[var(--text-main)] text-sm">{item.student?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <div className="text-3xl mb-1">{item.badge?.icon || '🏅'}</div>
                                        <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">{item.badge?.title}</span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <p className="text-xs font-bold text-gray-500 max-w-xs">{item.badge?.description}</p>
                                    </td>
                                    <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {history.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-8 text-5xl opacity-10 italic">#</div>
                        <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Milestone Neutral Zone</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No achievement synchronization detected in the matrix.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamificationHistory;
