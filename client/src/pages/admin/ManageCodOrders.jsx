import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContextObject';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ManageCodOrders = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_approval'); // approved, rejected

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/payment/pending-cod`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setOrders(data.payments);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAction = async (orderId, action) => {
        try {
            const endpoint = action === 'approve' ? 'approve-cod' : 'reject-cod';
            const { data } = await axios.post(`${backendUrl}/api/payment/${endpoint}`, { paymentId: orderId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(`Order ${action === 'approve' ? 'Approved' : 'Rejected'} successfully`);
                fetchOrders(); // Refresh list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} order`);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">COD Approval Hub</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage manual cash on delivery verification protocols.</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-xl shadow-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-slate-50/50">
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Course / Item</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            <AnimatePresence mode="popLayout">
                                {orders.length > 0 ? orders.map((order) => (
                                    <motion.tr 
                                        key={order._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                                                    {order.userId?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[var(--text-main)]">{order.userId?.name}</div>
                                                    <div className="text-xs text-[var(--text-muted)]">{order.userId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium">
                                            {order.courseId?.courseTitle || "Direct Transaction"}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-indigo-600">₹{order.amount}</span>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleAction(order._id, 'approve')}
                                                    className="px-4 py-2 bg-green-500 text-white text-xs font-black rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                                >
                                                    APPROVE
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(order._id, 'reject')}
                                                    className="px-4 py-2 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                                >
                                                    REJECT
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-400 italic">
                                            {loading ? "Decrypting order registry..." : "No pending COD verification protocols active."}
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageCodOrders;
