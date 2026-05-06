import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { History, Package, CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';

const PurchaseHistory = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/user/purchase-history');
            if (data.success) setHistory(data.history);
        } catch (error) {
            console.error('History Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [token]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Purchase Ledger</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Transaction Registry & Enrollment History</p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Asset</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-10 py-20 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest">No transaction records found in localized sector</td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <span className="text-[13px] font-black text-slate-900 tracking-tight uppercase tracking-tighter">{item.item}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Calendar size={14} />
                                                <span className="text-[11px] font-bold">{new Date(item.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-[13px] font-black text-slate-900 tracking-tight">{item.price}</span>
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

export default PurchaseHistory;




