import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageSquare, Filter, CheckCircle, XCircle, Trash2, Calendar, Search } from 'lucide-react';
import Pusher from 'pusher-js';

const ManageComments = () => {
    const { backendUrl, getHeaders, settings } = useContext(AppContext);
    const { pusher_app_key, pusher_active, pusher_cluster } = settings;
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        date: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(15);
    // Institutional Pagination v1.1

    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/comments`, {
                params: { ...filters, limit, skip: (page - 1) * limit },
                ...getHeaders()
            });
            if (data.success) {
                setComments(data.comments);
                setTotalPages(data.pages);
            }
        } catch (error) {
            toast.error('Strategic Intelligence Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { data } = await axios.patch(`${backendUrl}/api/comm/comments/${id}/status`, { status: newStatus }, getHeaders());
            if (data.success) {
                setComments(comments.map(c => c._id === id ? { ...c, status: newStatus } : c));
                toast.success(`Protocol Calibrated: ${newStatus.toUpperCase()}`);
            }
        } catch (error) {
            toast.error('Status Calibration Failed');
        }
    };

    useEffect(() => {
        setPage(1);
    }, [filters]);

    useEffect(() => {
        fetchComments();
    }, [filters, page]);

    // Strategic Real-time Relay (Module 5: Notifications)
    useEffect(() => {
        if (!pusher_app_key || !pusher_active) return;

        const pusher = new Pusher(pusher_app_key, {
            cluster: pusher_cluster || 'ap2',
            forceTLS: true
        });

        // Global Commentary Insight
        const channel = pusher.subscribe('global-comment-channel'); 
        channel.bind('new-comment', (data) => {
            fetchComments(); 
        });

        return () => {
            pusher.disconnect();
        };
    }, [pusher_app_key, pusher_active, pusher_cluster]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Institutional Commentary</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Scholarly Interaction & Blog Discourse Moderation Hub</p>
                </div>
                
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        <MessageSquare size={14} /> {comments.length} ACTIVE THREADS
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Type</label>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <select 
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl h-11 pl-12 pr-4 text-[10px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none uppercase tracking-widest"
                        >
                            <option value="">All Intellectual Assets</option>
                            <option value="Blog">Institutional Blog</option>
                            <option value="Topic">Course Discourse</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Status</label>
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl h-11 px-6 text-[10px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none uppercase tracking-widest"
                    >
                        <option value="">All States</option>
                        <option value="approved">Operational (Approved)</option>
                        <option value="pending">Under Review (Pending)</option>
                        <option value="spam">Quarantined (Spam)</option>
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal Node</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                            type="date" 
                            value={filters.date}
                            onChange={(e) => setFilters({...filters, date: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl h-11 pl-12 pr-4 text-[10px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 uppercase tracking-widest"
                        />
                    </div>
                </div>

                <button 
                    onClick={() => setFilters({ type: '', status: '', date: '' })}
                    className="h-11 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                    Reset Nexus
                </button>
            </div>

            {/* Comments Table */}
            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar</th>
                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discourse Asset</th>
                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Strategic Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-10 py-8"><div className="h-12 bg-gray-50 rounded-2xl w-full"></div></td>
                                </tr>
                            ))
                        ) : comments.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-10 py-32 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 rotate-12">💬</div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Interaction Void</h3>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">No strategic engagements detected in the current filter.</p>
                                </td>
                            </tr>
                        ) : comments.map((comment) => (
                            <tr key={comment._id} className="hover:bg-gray-50/30 transition-all group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-400 border border-indigo-100 group-hover:rotate-12 transition-transform">
                                            {comment.user?.avatar ? <img src={comment.user.avatar} className="w-full h-full object-cover rounded-xl" /> : comment.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 tracking-tight">{comment.user?.name}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8 max-w-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${comment.targetType === 'Blog' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                            {comment.targetType} Protocol
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm italic line-clamp-2">"{comment.content}"</p>
                                </td>
                                <td className="px-10 py-8">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        comment.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        comment.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            comment.status === 'approved' ? 'bg-emerald-500' : 
                                            comment.status === 'pending' ? 'bg-amber-500' : 
                                            'bg-rose-500'
                                        }`}></div>
                                        {comment.status}
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {comment.status !== 'approved' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(comment._id, 'approved')}
                                                className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-emerald-500/5"
                                                title="Approve Protocol"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                        {comment.status !== 'spam' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(comment._id, 'spam')}
                                                className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-amber-500/5"
                                                title="Quarantine as Spam"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                        <button 
                                            className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-rose-500/5"
                                            title="Permanently Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Institutional Pagination Protocol */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-10 py-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Protocol Page {page} of {totalPages}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-900 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
                        >
                            Previous Node
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-3 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 disabled:opacity-30 transition-all shadow-xl shadow-gray-200"
                        >
                            Next Node
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageComments;
