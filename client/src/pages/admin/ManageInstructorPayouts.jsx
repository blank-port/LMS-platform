import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { 
    DollarSign, Filter, Search, CheckCircle2, XCircle, 
    Clock, Download, MoreVertical, User, Calendar, 
    ArrowUpRight, ArrowDownRight, Wallet
} from 'lucide-react';
import { toast } from 'react-toastify';

const ManageInstructorPayouts = () => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [payouts, setPayouts] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        instructor: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/instructor-payouts`, {
                params: filters,
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setPayouts(data.payouts);
            }
        } catch (err) {
            toast.error('Failed to fetch payout requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/instructors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setInstructors(data.instructors);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchPayouts();
        fetchInstructors();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/instructor-payouts/${id}/status`, 
                { status },
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );
            if (data.success) {
                toast.success(`Payout ${status === 'success' ? 'authorized' : 'rejected'} successfully`);
                fetchPayouts();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const summaryStats = {
        pending: payouts.filter(p => p.status === 'pending').length,
        totalAmount: payouts.reduce((acc, p) => acc + p.amount, 0),
        pendingAmount: payouts.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0)
    };

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Finance</p>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Instructor Payouts</h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Manage and process educator withdrawal requests.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={16} />
                        EXPORT CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                        <Clock size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Requests</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{summaryStats.pending}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Amount</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{currency}{summaryStats.pendingAmount.toFixed(2)}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                        <ArrowUpRight size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Processed</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{currency}{(summaryStats.totalAmount - summaryStats.pendingAmount).toFixed(2)}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-8 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Instructor</label>
                    <select 
                        value={filters.instructor}
                        onChange={(e) => setFilters({...filters, instructor: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                        <option value="">All Instructors</option>
                        {instructors.map(inst => (
                            <option key={inst._id} value={inst._id}>{inst.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="success">Paid</option>
                        <option value="failed">Rejected</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Date Range</label>
                    <div className="flex gap-2">
                        <input 
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <input 
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                <button 
                    onClick={fetchPayouts}
                    className="h-[46px] px-8 bg-gray-900 text-white rounded-xl text-xs font-black shadow-lg shadow-gray-200 hover:bg-black transition-all"
                >
                    SEARCH
                </button>
            </div>

            {/* Payout Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Instructor</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Method</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Requested Date</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-8 py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                        ) : payouts.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-20 text-center font-bold text-gray-300">No payout requests found</td></tr>
                        ) : payouts.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black overflow-hidden shadow-sm">
                                            {p.userId?.avatar ? <img src={p.userId.avatar} className="w-full h-full object-cover" alt="" /> : p.userId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 leading-tight">{p.userId?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{p.userId?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-black text-gray-900">{currency}{p.amount.toFixed(2)}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">Bank Transfer</span>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                    {new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl inline-flex items-center gap-2 ${
                                        p.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        p.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                        'bg-rose-50 text-rose-500 border border-rose-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'success' ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                        {p.status === 'success' ? 'Paid' : p.status === 'pending' ? 'Pending' : 'Rejected'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center justify-center gap-2">
                                        {p.status === 'pending' ? (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusUpdate(p._id, 'success')}
                                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn"
                                                    title="Approve Payout"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(p._id, 'failed')}
                                                    className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm group/btn"
                                                    title="Reject Payout"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Processed</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageInstructorPayouts;
