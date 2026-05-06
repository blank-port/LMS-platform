import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { HelpCircle, Lock, Unlock, MessageSquare, Filter, ChevronRight, User as UserIcon } from 'lucide-react';
import Pusher from 'pusher-js';

const ManageQA = () => {
    const { backendUrl, allCourses, settings } = useContext(AppContext);
    const { pusher_app_key, pusher_active, pusher_cluster } = settings;
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        courseId: '',
        status: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    // Institutional Pagination v1.1

    const fetchQA = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/comm/qa', {
                params: { ...filters, limit, skip: (page - 1) * limit }
            });
            if (data.success) {
                setDiscussions(data.discussions);
                setTotalPages(data.pages);
            }
        } catch (error) {
            toast.error('Strategic Inquiry Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleReserveToggle = async (id) => {
        try {
            const { data } = await api.post(`/comm/qa/${id}/reserve`, {});
            if (data.success) {
                setDiscussions(discussions.map(d => d._id === id ? { ...d, isReserved: data.isReserved } : d));
                toast.success(data.message);
            }
        } catch (error) {
            toast.error('Protocol Lock Failure');
        }
    };

    useEffect(() => {
        setPage(1);
    }, [filters]);

    useEffect(() => {
        fetchQA();
    }, [filters, page]);

    // Strategic Real-time Relay (Module 5: Notifications)
    useEffect(() => {
        if (!pusher_app_key || !pusher_active) return;

        const pusher = new Pusher(pusher_app_key, {
            cluster: pusher_cluster || 'ap2',
            forceTLS: true
        });

        // Global Q&A Insight
        const channel = pusher.subscribe('global-qa-channel'); // Need to ensure backend sends to this for admins
        channel.bind('new-discussion', (data) => {
            fetchQA(); 
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
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Question & Answer Hub</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Cross-Curriculum Academic Inquiry & Instruction Oversight Portal</p>
                </div>
                
                <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
                    <HelpCircle size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{discussions.length} PENDING INQUIRIES</span>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Learning Track</label>
                    <select 
                        value={filters.courseId}
                        onChange={(e) => setFilters({...filters, courseId: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl h-11 px-6 text-[10px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none uppercase tracking-widest"
                    >
                        <option value="">All Curriculum Tracks</option>
                        {allCourses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Inquiry State</label>
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl h-11 px-6 text-[10px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none uppercase tracking-widest"
                    >
                        <option value="">All Inquiries</option>
                        <option value="active">Active Discourse</option>
                        <option value="closed">Resolved/Closed</option>
                    </select>
                </div>

                <button 
                    onClick={() => setFilters({ courseId: '', status: '' })}
                    className="h-11 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                    Reset Analytics
                </button>
            </div>

            {/* Q&A Content */}
            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="px-12 py-10">
                    <div className="space-y-8">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse h-40 bg-gray-50 rounded-[2.5rem]"></div>
                            ))
                        ) : discussions.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">❓</div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Question Silence</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">No scholarly inquiries detected across the selected parameters.</p>
                            </div>
                        ) : discussions.map((q) => (
                            <div key={q._id} className="relative bg-[var(--background)]/30 rounded-[3rem] p-10 border border-transparent hover:border-indigo-100 hover:bg-white transition-all group overflow-hidden">
                                {q.isReserved && (
                                    <div className="absolute top-0 right-0 bg-rose-500 text-white px-6 py-2 rounded-bl-3xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Lock size={10} /> Administrative Lock
                                    </div>
                                )}
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-gray-200 flex items-center justify-center text-xl border border-gray-100">
                                                {q.userId?.avatar ? <img src={q.userId.avatar} className="w-full h-full object-cover rounded-2xl" /> : <UserIcon className="text-gray-300" />}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 tracking-tight flex items-center gap-3">
                                                    {q.userId?.name} 
                                                    <ChevronRight size={14} className="text-gray-300" /> 
                                                    <span className="text-indigo-600 italic tracking-tight">{q.courseId?.courseTitle}</span>
                                                </h3>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                    Inquiry Node: {q.lessonId || 'Curriculum Overview'} • {new Date(q.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium italic border-l-4 border-indigo-100 pl-6 py-2">"{q.message}"</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleReserveToggle(q._id)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${q.isReserved ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'}`}
                                            title={q.isReserved ? "Unlock Question" : "Lock Question"}
                                        >
                                            {q.isReserved ? <Lock size={20} /> : <Unlock size={20} />}
                                        </button>
                                        <button 
                                            className="h-14 px-8 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
                                        >
                                            <MessageSquare size={16} /> Deploy Response
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${q.isReplied ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {q.isReplied ? 'Resolution Captured' : 'Awaiting Intellectual Input'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Protocol ID: QA-{q._id.substring(18).toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Institutional Pagination Protocol */}
            {!loading && totalPages > 1 && (
                <div className="mx-4 flex items-center justify-between bg-white px-10 py-6 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">
                            Inquiry Page {page} of {totalPages}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-900 rounded-2xl hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100 shadow-sm"
                        >
                            Previous Node
                        </button>
                        <div className="flex items-center gap-1">
                             {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-3 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 disabled:opacity-30 transition-all shadow-xl shadow-gray-200"
                        >
                            Next Node
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageQA;




