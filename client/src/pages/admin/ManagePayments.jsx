import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagePayments = ({ title, method }) => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const fetchPendingPayments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/payment/pending?method=${method || 'all'}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setPayments(data.payments);
            }
        } catch (error) {
            toast.error("Fiscal Intelligence Retrieval Failure");
        }
        setLoading(false);
    };

    const handleApprove = async (paymentId) => {
        const actionToast = toast.loading('Authorizing Fiscal Transaction...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/payment/approve-cod`, { paymentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.update(actionToast, { render: 'Transaction authorized. Scholar access granted.', type: "success", isLoading: false, autoClose: 3000 });
                fetchPendingPayments();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Transaction authorization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Fiscal Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight text-center sm:text-left">{title || "Fiscal Transaction Authorization"}</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] text-center sm:text-left">
                        {method === 'razorpay' ? 'Digital Gateway Oversight' : 
                         method === 'bank_transfer' ? 'Bank Asset Verification' : 
                         'Pending COD (Cash On Deployment) Request Orchestration'}
                    </p>
                </div>
            </div>

            {/* Authorization Queue */}
            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Authorization Queue</h3>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">{payments.length} PENDING PROTOCOLS</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Scholar Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Curriculum Asset</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Gross Amount</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Request Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Protocol Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center">
                                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 rotate-12">💳</div>
                                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Fiscal Queue Neutral</h3>
                                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No pending authorization protocols detected.</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-[1rem] bg-gray-900 text-white flex items-center justify-center text-[11px] font-black group-hover:bg-purple-600 transition-colors">
                                                    {payment.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[var(--text-main)] text-sm tracking-tight capitalize">{payment.user?.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 italic lowercase tracking-wider">{payment.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">{payment.course?.courseTitle}</p>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-black text-[var(--text-main)] font-mono tracking-tighter">{currency}{payment.amount}</span>
                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">Gross Value</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button 
                                                onClick={() => handleApprove(payment._id)}
                                                className="h-12 px-8 bg-[var(--background)] text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-600 hover:text-white hover:shadow-xl hover:shadow-purple-200 transition-all border border-[var(--border)]"
                                            >
                                                Authorize Protocol
                                            </button>
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

export default ManagePayments;

