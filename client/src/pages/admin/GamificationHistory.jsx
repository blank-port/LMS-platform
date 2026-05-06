import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const GamificationHistory = () => {
    const { backendUrl } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/gamification/history-all');
            if (data.success) setHistory(data.history);
        } catch (error) {
            toast.error('Audit Log Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Retrieving Intelligence Audit Logs...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Cognitive Audit History</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Global Points Disbursement & Behavioral Attribution Registry</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[var(--border)]">
                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Scholar Identity</th>
                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Behavioral Event</th>
                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Protocol Attribution</th>
                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Impact Ratio</th>
                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-right">Synchronization Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {history.map((log) => (
                            <tr key={log._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                <td className="py-6 px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400 font-black text-sm">
                                            {log.userId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[var(--text-main)]">{log.userId?.name || 'Anonymous Session'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{log.userId?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 px-4">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-gray-100 text-gray-500`}>
                                        {log.event.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="py-6 px-4 text-xs font-bold text-[var(--text-muted)] italic">
                                    {log.description}
                                </td>
                                <td className="py-6 px-4">
                                    <span className={`text-sm font-black ${log.points > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                        {log.points > 0 ? `+${log.points}` : log.points}
                                    </span>
                                </td>
                                <td className="py-6 px-4 text-right tabular-nums text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {history.length === 0 && (
                    <div className="py-32 text-center">
                        <div className="text-4xl mb-6 opacity-20">📜</div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Audit Registry Void - No Data Synchronized</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamificationHistory;




