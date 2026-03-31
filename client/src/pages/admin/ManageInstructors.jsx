import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageInstructors = () => {
    const { backendUrl, token, navigate } = useContext(AppContext);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchInstructors(); }, []);

    const fetchInstructors = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/instructors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setInstructors(data.instructors);
        } catch (error) { toast.error('Educator Directory Retrieval Failure'); }
        setLoading(false);
    };

    const handleApproval = async (id, isApproved) => {
        const actionToast = toast.loading(isApproved ? 'Authorizing Educator Identity...' : 'Revoking Educator Credentials...');
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/instructors/${id}/approve`, { isApproved }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.update(actionToast, { render: isApproved ? 'Educator authorized.' : 'Credentials revoked.', type: "success", isLoading: false, autoClose: 3000 });
                fetchInstructors();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Authorization protocol failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Educator Assets...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Educator Asset Stewardship</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Personnel Oversight & Pedagogical Authority Governance</p>
                </div>
                <div className="flex items-center gap-4 bg-[var(--background)] px-6 py-3 rounded-2xl border border-[var(--border)]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Educators:</span>
                    <span className="text-lg font-black text-purple-400">{instructors.length}</span>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descriptor</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Identity Hub</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorization</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Revenue Stream</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {instructors.map((inst) => (
                                <tr key={inst._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-black/10/10 group-hover:scale-105 transition-transform border border-white/10">
                                                {inst.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)] tracking-tight">{inst.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider italic">ID: {inst._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 hidden md:table-cell">
                                        <p className="text-xs font-bold text-[var(--text-muted)] tracking-tight">{inst.email}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${inst.isApproved ? 'bg-green-900/20 text-green-400' : 'bg-amber-900/20 text-amber-400'}`}>
                                            {inst.isApproved ? '✓ Validated' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-[var(--text-main)] uppercase">Settled: $0.00</span>
                                            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-1">Payout: Pending</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => navigate(`/admin/report-instructor-revenue?id=${inst._id}`)} className="h-9 px-4 bg-[var(--surface)] border border-[var(--border)] text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[var(--background)] transition-all shadow-sm">Ledgers</button>
                                            {inst.isApproved ? (
                                                <button onClick={() => handleApproval(inst._id, false)} className="h-9 px-4 bg-red-900/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">Revoke</button>
                                            ) : (
                                                <button onClick={() => handleApproval(inst._id, true)} className="h-9 px-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-600 transition-all shadow-lg shadow-black/10/10">Authorize</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {instructors.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">🎓</div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Educator Matrix Empty</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No pedagogical assets detected in the personnel repository.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageInstructors;

