import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    Filter, 
    Search, 
    CheckCircle, 
    XCircle, 
    Star, 
    Layers, 
    Download,
    Trash2,
    CheckSquare,
    Square,
    BookOpen
} from 'lucide-react';

const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReviews, setSelectedReviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/review/all');
            if (data.success) setReviews(data.reviews);
        } catch (error) {
            toast.error('Failed to load reviews.');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            toast.warning("No feedback available for export.");
            return;
        }
        const headers = ['Student', 'Course', 'Rating', 'Comment', 'Status', 'Date'].join(',');
        const rows = data.map(r => [
            r.userId?.name,
            r.courseId?.courseTitle,
            r.rating,
            String(r.comment).replace(/"/g, '""'),
            r.status,
            new Date(r.createdAt).toLocaleDateString()
        ].map(val => `"${val}"`).join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Feedback report exported.`);
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
        const actionToast = toast.loading(`Updating status to ${newStatus}...`);
        try {
            const { data } = await api.patch(`/review/${id}/status`, { status: newStatus });
            if (data.success) {
                toast.update(actionToast, { render: `Review ${newStatus}.`, type: "success", isLoading: false, autoClose: 3000 });
                fetchReviews();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Status update failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleBulkToggle = async () => {
        if (selectedReviews.length === 0) return;
        const actionToast = toast.loading(`Updating ${selectedReviews.length} reviews...`);
        try {
            await Promise.all(selectedReviews.map(id => {
                const current = reviews.find(r => r._id === id);
                const newStatus = current.status === 'approved' ? 'rejected' : 'approved';
                return api.patch(`/review/${id}/status`, { status: newStatus });
            }));
            toast.update(actionToast, { render: 'Status update complete.', type: "success", isLoading: false, autoClose: 3000 });
            setSelectedReviews([]);
            fetchReviews();
        } catch (error) {
            toast.update(actionToast, { render: 'Batch update failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedReviews.length === 0) return;
        if (!window.confirm(`Permanently delete ${selectedReviews.length} reviews?`)) return;
        
        const actionToast = toast.loading(`Deleting ${selectedReviews.length} reviews...`);
        try {
            await Promise.all(selectedReviews.map(id => api.delete(`/review/${id}`)));
            toast.update(actionToast, { render: 'Reviews deleted.', type: "success", isLoading: false, autoClose: 3000 });
            setSelectedReviews([]);
            fetchReviews();
        } catch (error) {
            toast.update(actionToast, { render: 'Batch delete failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const toggleSelection = (id) => {
        setSelectedReviews(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    useEffect(() => { fetchReviews(); }, []);

    const filteredReviews = reviews.filter(r => {
        const matchesRating = filterRating === 'all' || r.rating === Number(filterRating);
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        const matchesSearch = !searchQuery || 
                             r.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             r.courseId?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRating && matchesStatus && matchesSearch;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Syncing Reviews...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-gray-100 pb-12">
                <div>
                    <h1 className="text-4xl font-black text-[#0C132B] tracking-tight">Review Management</h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[9px] tracking-[0.3em]">Manage student feedback and course ratings</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={() => exportToCSV(filteredReviews, 'PrismEd_Reviews')}
                        className="h-14 px-8 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-gray-200 transition-all shadow-sm"
                    >
                        <Download size={14} />
                        Export All
                    </button>
                    {selectedReviews.length > 0 && (
                        <>
                            <button 
                                onClick={handleBulkToggle}
                                className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-3 shadow-xl"
                            >
                                <Layers size={16} />
                                Toggle Status ({selectedReviews.length})
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-3 shadow-xl"
                            >
                                <Trash2 size={16} />
                                Delete ({selectedReviews.length})
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                <div className="md:col-span-2 relative">
                    <input 
                        type="text" 
                        placeholder="Search Students or Courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border-none p-4 pl-12 rounded-xl text-xs font-bold text-[#0C132B] outline-none placeholder:text-gray-400 transition-all focus:bg-white focus:ring-4 focus:ring-gray-100/50"
                    />
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>

                <div className="relative">
                    <select 
                        value={filterRating} 
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="w-full bg-gray-50 border-none p-4 pl-12 rounded-xl text-xs font-bold text-[#0C132B] outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-all"
                    >
                        <option value="all">Rating</option>
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                    <Star size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                </div>

                <div className="relative">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-gray-50 border-none p-4 pl-12 rounded-xl text-xs font-bold text-[#0C132B] outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-all"
                    >
                        <option value="all">Status</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {filteredReviews.map(review => (
                    <div 
                        key={review._id} 
                        className={`bg-white rounded-[3rem] p-8 flex items-start gap-8 group transition-all border ${selectedReviews.includes(review._id) ? 'border-amber-500 shadow-2xl shadow-amber-500/5 bg-amber-50/10' : 'border-gray-50 hover:shadow-xl hover:shadow-gray-200/50'}`}
                    >
                        <button 
                            onClick={() => toggleSelection(review._id)}
                            className={`mt-4 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedReviews.includes(review._id) ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-300 hover:text-amber-500'}`}
                        >
                            {selectedReviews.includes(review._id) ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>

                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 uppercase font-black text-gray-400 shadow-sm">
                            {review.userId?.name?.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-[#0C132B] tracking-tight">{review.userId?.name}</h3>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                        <BookOpen size={12} />
                                        Course: {review.courseId?.courseTitle}
                                    </p>
                                </div>
                                <div className="flex gap-1 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100/50">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} className={`text-sm ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                    ))}
                                </div>
                            </div>
                            
                            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8 border-l-4 border-gray-100 pl-6 italic bg-gray-50/50 p-4 rounded-r-2xl">"{review.comment}"</p>
                            
                            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                                <div className="flex items-center gap-6">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-xl flex items-center gap-2 ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                        {review.status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {review.status}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => toggleStatus(review._id, review.status)} 
                                        className="h-12 px-8 bg-[#0C132B] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-amber-500 transition-all shadow-2xl shadow-black/10 active:scale-95"
                                    >
                                        {review.status === 'approved' ? 'Reject' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredReviews.length === 0 && (
                    <div className="py-32 text-center bg-gray-50/30 rounded-[4rem] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm grayscale opacity-30">💬</div>
                        <h3 className="text-xl font-black text-[#0C132B] tracking-tight">No Reviews Found</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">No student reviews match the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReviews;


