import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageReviews = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/communication/reviews`, getHeaders());
            if (data.success) setReviews(data.reviews);
        } catch (error) {
            toast.error('Feedback Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
        const actionToast = toast.loading(`Synchronizing Review State: ${newStatus}...`);
        try {
            const { data } = await axios.put(`${backendUrl}/api/communication/review/${id}/status`, { status: newStatus }, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: `Protocol ${newStatus} successfully.`, type: "success", isLoading: false, autoClose: 3000 });
                fetchReviews();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-amber-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Optimizing Feedback Streams...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Feedback Stream Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Scholar sentiment monitoring & Academic Integrity oversight</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {reviews.map(review => (
                    <div key={review._id} className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-8 flex items-start gap-8 group hover:shadow-2xl hover:shadow-amber-50 transition-all">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--background)] flex items-center justify-center shrink-0">
                            <span className="text-2xl">{review.student?.name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight">{review.student?.name}</h3>
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mt-1">Reviewing: {review.course?.courseTitle}</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} className={`text-lg ${star <= review.rating ? 'text-amber-400' : 'text-gray-100'}`}>★</span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed mb-6 italic">"{review.comment}"</p>
                            <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${review.status === 'approved' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                    {review.status} Protocol
                                </span>
                                <div className="flex gap-4">
                                    <button onClick={() => toggleStatus(review._id, review.status)} className="h-10 px-8 bg-gray-900 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-amber-600 transition-all shadow-lg">
                                        Toggle Authorization
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="py-24 text-center bg-[var(--background)]/50 rounded-[4rem] border-2 border-dashed border-[var(--border)] italic">
                        <span className="text-6xl opacity-10">💭</span>
                        <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight mt-6">Sentiment Void</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No feedback streams detected in the matrix.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReviews;
