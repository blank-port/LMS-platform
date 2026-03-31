import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageDeleteRequests = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/users`, getHeaders());
            if (data.success) {
                setRequests(data.users.filter(u => u.deleteRequest?.isRequested));
            }
        } catch (error) {
            toast.error('Deletion Signal Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        const actionToast = toast.loading('Executing Permanent Data Erasure...');
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/user/${userId}`, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Entity purged from institutional records.', type: "success", isLoading: false, autoClose: 3000 });
                fetchRequests();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Erasure operation compromised.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-red-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Scanning Deletion Signals...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Post-Operational Data Erasure</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Account Termination Requests & Permanent Identity Purge Protocols</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-red-50 overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center bg-red-50/10">
                    <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">Termination Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Entity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Semantic Reason</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol Timestamp</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Termination Execution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {requests.map(user => (
                                <tr key={user._id} className="group hover:bg-red-50/20 transition-colors">
                                    <td className="px-10 py-6">
                                        <p className="font-black text-[var(--text-main)] text-sm tracking-tight">{user.name}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user.email}</p>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-bold text-gray-500 italic max-w-xs truncate">"{user.deleteRequest?.reason || 'Protocol Silent'}"</td>
                                    <td className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(user.deleteRequest?.requestDate).toLocaleDateString()}</td>
                                    <td className="px-10 py-6 text-right">
                                        <button onClick={() => handleDelete(user._id)} className="h-10 px-6 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-lg shadow-red-100">Confirm Erasure</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {requests.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-8 text-5xl opacity-10">🛡️</div>
                        <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Institutional Integrity Confirmed</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No pending termination signals detected in the matrix.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageDeleteRequests;
