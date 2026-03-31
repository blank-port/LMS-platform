import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageFinancials = ({ type }) => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [data, setData] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchFinancials = async () => {
        try {
            if (type === 'revenue') {
                const { data } = await axios.get(`${backendUrl}/api/finance/admin-revenue`, getHeaders());
                if (data.success) setRevenue(data.revenue);
            }
            
            const endpoint = type === 'revenue' ? '/api/finance/payments' : '/api/finance/refunds';
            const { data: resData } = await axios.get(`${backendUrl}${endpoint}`, getHeaders());
            if (resData.success) {
                setData(resData.data);
            }
        } catch (error) {
            toast.error('Fiscal Intelligence Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, [type]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Fiscal Intelligence...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight capitalize">{type} Intelligence Oversight</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Global Revenue Orchestration & Fiscal Transaction Ledger</p>
                </div>
            </div>

            {type === 'revenue' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-green-50 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl group-hover:scale-110 transition-transform">💎</div>
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4">Gross Strategic Revenue</p>
                        <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{revenue.toLocaleString()}</h2>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Live Synchronized</span>
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-50 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl group-hover:scale-110 transition-transform">🏛️</div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Operational Net (30%)</p>
                        <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{(revenue * 0.3).toLocaleString()}</h2>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Protocol Adjusted</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Transaction Ledger</h3>
                    <div className="flex gap-4">
                        <button className="text-[10px] font-black text-gray-400 hover:text-purple-400 transition-colors uppercase tracking-widest">Fiscal Export</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Unit</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Gross Value</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol Badge</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Synchronization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {data.map(item => (
                                <tr key={item.id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6 font-mono text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">{item.id}</td>
                                    <td className="px-10 py-6 font-black text-[var(--text-main)] text-sm tracking-tight">{item.user}</td>
                                    <td className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{item.course}</td>
                                    <td className="px-10 py-6 text-center">
                                        <span className="text-sm font-black text-[var(--text-main)] font-mono tracking-tighter">₹{item.amount}</span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all ${item.status === 'Completed' ? 'bg-green-900/20 border-green-800/30 text-green-400' : 'bg-red-900/20 border-red-100 text-red-400'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 rotate-12">💳</div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Fiscal Neutral Zone</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No transaction synchronization detected in the ledger.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageFinancials;

