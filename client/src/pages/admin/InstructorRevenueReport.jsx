import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

const InstructorRevenueReport = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const instructorId = searchParams.get('id');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            const endpoint = instructorId 
                ? `${backendUrl}/api/finance/instructor-revenue/${instructorId}`
                : `${backendUrl}/api/finance/admin-revenue`;
            const { data } = await axios.get(endpoint, getHeaders());
            if (data.success) setReport(data.report);
        } catch (error) {
            toast.error('Fiscal Intelligence Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, [instructorId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Fiscal Distributions...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Educator Revenue Intelligence</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Fiscal Allocation Analysis & Remuneration Distribution Ledger</p>
                </div>
            </div>

            {report && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm group hover:shadow-xl hover:shadow-purple-50 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl group-hover:scale-110 transition-transform">💰</div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Total Accrued Revenue</p>
                        <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{report.totalRevenue.toLocaleString()}</h2>
                    </div>
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm group hover:shadow-xl hover:shadow-green-50 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl group-hover:scale-110 transition-transform">📈</div>
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4">Educator Share (Authorized)</p>
                        <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{report.instructorShare.toLocaleString()}</h2>
                    </div>
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm group hover:shadow-xl hover:shadow-blue-50 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl group-hover:scale-110 transition-transform">🏛️</div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Institutional Capture</p>
                        <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{report.adminShare.toLocaleString()}</h2>
                    </div>
                </div>
            )}

            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)]">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Curriculum Revenue Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Title</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Enrollment Volume</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Gross Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {report?.courseBreakdown.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6 font-black text-[var(--text-main)] text-sm tracking-tight">{item.title}</td>
                                    <td className="px-10 py-6 text-center text-xs font-bold text-gray-500">{item.enrollments} Scholars</td>
                                    <td className="px-10 py-6 text-right font-black text-[var(--text-main)] font-mono tracking-tighter text-sm">₹{item.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorRevenueReport;
