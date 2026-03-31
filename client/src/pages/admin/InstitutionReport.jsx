import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstitutionReport = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInstitutes = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/audit/institute/all`, getHeaders());
            if (data.success) setInstitutes(data.institutes);
        } catch (error) {
            toast.error('Institutional Benchmarking Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInstitutes(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Scaling Institutional Data...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Institutional Benchmarking Matrix</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Comparative Performance Analysis & Organizational Node Efficacy</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Organizational Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Institutional Node</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Educator Density</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Scholar Density</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Efficacy Ratio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {institutes.map(inst => (
                                <tr key={inst._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-900/20 flex items-center justify-center text-purple-400 font-black text-sm">
                                                {inst.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-[var(--text-main)] text-sm tracking-tight">{inst.name}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{inst.location}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center font-bold text-[var(--text-muted)] text-sm">{inst.instructorsCount || 0}</td>
                                    <td className="px-10 py-6 text-center font-bold text-[var(--text-muted)] text-sm">{inst.studentsCount || 0}</td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-24 h-2 bg-[var(--background)] rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-600" style={{ width: `${Math.min(100, (inst.studentsCount / 100) * 100)}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-[var(--text-main)]">{Math.min(100, (inst.studentsCount / 100) * 100).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstitutionReport;
