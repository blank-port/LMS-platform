import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp } from 'lucide-react';

const InstructorPayouts = () => {
    const { currency } = useContext(AppContext);
    const [payouts, setPayouts] = useState([]);
    const [summary, setSummary] = useState({ totalEarnings: 0, totalWithdrawn: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const { data } = await api.get('/instructor/payouts');
                if (data.success) {
                    setPayouts(data.payouts);
                    setSummary(data.summary);
                }
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchPayouts();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const summaryCards = [
        { label: 'Total Earnings', value: `${currency}${summary.totalEarnings.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Withdrawn', value: `${currency}${summary.totalWithdrawn.toFixed(2)}`, icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Available Balance', value: `${currency}${summary.balance.toFixed(2)}`, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Financial Overview</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Payout List</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {summaryCards.map((card, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                            <card.icon size={24} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Transaction History</h2>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{payouts.length} records</span>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">#</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Type</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Source</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Description</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {payouts.length === 0 ? (
                            <tr><td colSpan={7} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No payout records found</td></tr>
                        ) : payouts.map((p, i) => (
                            <tr key={p._id || i} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-8 py-5 text-[10px] font-black text-gray-300">#{i + 1}</td>
                                <td className="px-8 py-5">
                                    <div className={`flex items-center gap-2 ${p.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {p.type === 'credit' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{p.type}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm font-black text-gray-900">{currency}{p.amount}</td>
                                <td className="px-8 py-5">
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">{p.source?.replace(/_/g, ' ')}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${p.status === 'success' ? 'bg-emerald-50 text-emerald-600' : p.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>{p.status}</span>
                                </td>
                                <td className="px-8 py-5 text-xs font-medium text-gray-500 max-w-[200px] truncate">{p.description || '—'}</td>
                                <td className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InstructorPayouts;




