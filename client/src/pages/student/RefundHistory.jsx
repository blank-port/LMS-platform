import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { History, RotateCcw, MessageSquare, Calendar, ChevronRight, Ban, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const RefundHistory = () => {
    const { backendUrl, token, enrolledCourses } = useContext(AppContext);
    const [refunds, setRefunds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ courseId: '', paymentId: 'dummy_payment', reason: '' });

    const fetchRefunds = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/finance/my-refunds`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (data.success) setRefunds(data.refunds);
        } catch (error) {
            console.error('Refund Fetch Error:', error);
        }
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Initiating Refund Protocol...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/finance/request-refund`, formData, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (data.success) {
                toast.update(actionToast, { render: 'Protocol engaged. Admin review pending.', type: "success", isLoading: false, autoClose: 3000 });
                setShowForm(false);
                fetchRefunds();
            } else {
                toast.update(actionToast, { render: data.message || 'Protocol failure.', type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Communication failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchRefunds(); }, [token]);

    const statusColors = {
        requested: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
        completed: 'bg-blue-50 text-blue-600 border-blue-100'
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 text-uppercase">Fiscal Returns Matrix</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] opacity-80">Refund Management & Strategic Cancellations</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-rose-600 transition-all shadow-2xl shadow-black/10 active:scale-95"
                >
                    {showForm ? 'Cancel Operation' : 'Request Refund'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in slide-in-from-top duration-500 max-w-2xl mx-auto">
                    <form onSubmit={handleRequest} className="space-y-10 text-center">
                        <div>
                           <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">Refund Request Protocol</h2>
                           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest opacity-80">Sector 1: Identity & Reason Verification</p>
                        </div>
                        <div className="space-y-6 text-left">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Select Curriculum Sector</label>
                              <select 
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[13px] font-black tracking-tight focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all"
                                 required
                                 value={formData.courseId}
                                 onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                              >
                                 <option value="">System Select...</option>
                                 {enrolledCourses.map(e => (
                                    <option key={e.courseId?._id} value={e.courseId?._id}>
                                       {e.courseId?.courseTitle}
                                    </option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Fiscal Rationalization (Reason)</label>
                              <textarea 
                                 className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-[13px] font-black tracking-tight focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all h-32"
                                 placeholder="Sector why refund protocol is required..."
                                 required
                                 value={formData.reason}
                                 onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                 style={{ resize: 'none' }}
                              />
                           </div>
                        </div>
                        <button className="w-full h-16 bg-rose-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4rem] hover:bg-black transition-all duration-500 shadow-xl shadow-rose-500/20 active:scale-95">
                           Transmit Request
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Stream</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {refunds.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-10 py-20 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest">Neural channel clear: No return logs detected</td>
                                </tr>
                            ) : (
                                refunds.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <span className="text-[13px] font-black text-slate-900 tracking-tight uppercase tracking-tighter">{r.course?.courseTitle || 'System Fragment'}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Calendar size={14} />
                                                <span className="text-[11px] font-bold">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusColors[r.status]} border`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'requested' ? 'animate-pulse' : ''} bg-current`}></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{r.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 max-w-[200px]">
                                            <span className="text-[11px] font-bold text-slate-400 italic line-clamp-1">{r.adminComment || 'In transit...'}</span>
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

export default RefundHistory;
