import React, { useContext, useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { MessageSquare, Send, Reply, Trash2, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AppContext } from '../../context/AppContextObject.jsx';

const DiscussionSystem = ({ courseId, cohortId, lessonId }) => {
    const { user } = useContext(AppContext);
    const [comments, setComments] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState('newest'); // newest | golden
    const [filterBy, setFilterBy] = useState('all'); // all | resolved | golden

    useEffect(() => {
        fetchComments();
    }, [courseId, cohortId, lessonId]);

    const fetchComments = async () => {
        try {
            const params = { courseId, cohortId, lessonId };
            const { data } = await api.get('/discussion/fetch', { params });
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Failed to load discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSortAndFilter = (data) => {
        let filtered = [...data];
        
        if (filterBy === 'resolved') {
            filtered = filtered.filter(c => c.status === 'closed' || c.isReplied);
        } else if (filterBy === 'golden') {
            filtered = filtered.filter(c => c.isGoldenKnowledge);
        }

        if (sortBy === 'golden') {
            filtered.sort((a, b) => (b.isGoldenKnowledge ? 1 : 0) - (a.isGoldenKnowledge ? 1 : 0));
        } else {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filtered;
    };

    const handleToggleGolden = async (id) => {
        try {
            const { data } = await api.patch(`/discussion/golden/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchComments();
            }
        } catch (error) {
            toast.error('Strategic failure: Access denied');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'closed' ? 'active' : 'closed';
        try {
            const { data } = await api.patch(`/discussion/moderate/${id}`, { status: nextStatus });
            if (data.success) {
                toast.success(`Question status evolved to ${nextStatus}`);
                fetchComments();
            }
        } catch (error) {
            toast.error('Strategic failure: Access denied');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSubmitting(true);
        try {
            const { data } = await api.post('/discussion/add', {
                courseId,
                cohortId,
                lessonId,
                message: newMessage,
                parentId: replyTo?._id
            });

            if (data.success) {
                toast.success('Comment posted');
                setNewMessage('');
                setReplyTo(null);
                fetchComments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            const { data } = await api.delete(`/discussion/${id}`);
            if (data.success) {
                toast.success('Comment deleted');
                fetchComments();
            }
        } catch (error) {
            toast.error('Strategic failure: Access denied');
        }
    };

    const canDeleteComment = (comment) => {
        if (!user || !comment?.userId) return false;

        const currentUserId = user._id || user.id;
        const commentAuthorId = comment.userId?._id || comment.userId?.id;
        const isAuthor = currentUserId && commentAuthorId && currentUserId === commentAuthorId;
        const canModerate = ['instructor', 'admin'].includes(user.role);

        return isAuthor || canModerate;
    };

    const CommentItem = ({ comment, isReply = false }) => {
        const isInstructor = ['instructor', 'admin'].includes(user?.role);

        return (
            <div className={`group/comment flex gap-4 p-5 rounded-[1.5rem] border transition-all ${comment.isGoldenKnowledge ? 'border-emerald-500/30 bg-emerald-500/5' : isReply ? 'ml-8 bg-white/[0.02] border-white/5' : 'bg-white/[0.04] border-white/10'} mb-4`}>
                <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                    {comment.userId?.profilePicture ? (
                        <img src={comment.userId.profilePicture} alt="" className="size-full object-cover" />
                    ) : (
                        <UserIcon className="size-5 text-blue-300" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-white tracking-tight uppercase">{comment.userId?.name || 'Scholar'}</span>
                            {comment.userId?.role === 'instructor' && (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-[8px] font-black uppercase text-emerald-400 border border-emerald-500/30 tracking-widest">
                                    Strategic Lead
                                </span>
                            )}
                            {comment.isGoldenKnowledge && (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/20">
                                    <Sparkles size={8} /> Golden Knowledge
                                </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                            {isInstructor && !isReply && (
                                <>
                                    <button 
                                        onClick={() => handleToggleGolden(comment._id)} 
                                        className={`p-2 rounded-lg transition-all ${comment.isGoldenKnowledge ? 'text-amber-500 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400'}`}
                                        title={comment.isGoldenKnowledge ? "Unseal Knowledge" : "Mark as Golden Knowledge"}
                                    >
                                        <Sparkles className="size-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(comment._id, comment.status)} 
                                        className={`p-2 rounded-lg transition-all ${comment.status === 'closed' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 hover:text-emerald-400'}`}
                                        title={comment.status === 'closed' ? "Reopen Inquiry" : "Mark as Resolved"}
                                    >
                                        <CheckCircle2 className="size-4" />
                                    </button>
                                </>
                            )}
                            {canDeleteComment(comment) && (
                                <button onClick={() => handleDelete(comment._id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        {comment.message}
                    </p>
                    <div className="flex items-center gap-4">
                        {!isReply && comment.status !== 'closed' && (
                            <button 
                                onClick={() => setReplyTo(comment)}
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                            >
                                <Reply className="size-3" />
                                Transmit Reply
                            </button>
                        )}
                        {comment.status === 'closed' && (
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 size={10} /> Resolved Discourse
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const processedComments = handleSortAndFilter(comments);

    return (
        <div className="bg-[#0f1014] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
            
            <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/5">
                        <MessageSquare className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1">Scholastic Discourse</h3>
                        <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black">Neural Engagement Matrix</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setFilterBy('all')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterBy === 'all' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilterBy('golden')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterBy === 'golden' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Golden
                        </button>
                        <button 
                            onClick={() => setFilterBy('resolved')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterBy === 'resolved' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Resolved
                        </button>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setSortBy('newest')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'newest' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Newest
                        </button>
                        <button 
                            onClick={() => setSortBy('golden')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'golden' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Priority
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 max-h-[700px] overflow-y-auto custom-scrollbar space-y-2 relative z-10">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <div className="size-10 border-4 border-t-blue-500 border-white/10 rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Syncing discourse streams...</p>
                    </div>
                ) : processedComments.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                        <MessageSquare className="size-16 text-white/5 mx-auto mb-6" />
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Subspace channel silent</p>
                    </div>
                ) : (
                    processedComments.map(comment => (
                        <div key={comment._id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <CommentItem comment={comment} />
                            {comment.replies?.map(reply => (
                                <CommentItem key={reply._id} comment={reply} isReply />
                            ))}
                        </div>
                    ))
                )}
            </div>

            <div className="p-8 bg-white/[0.03] border-t border-white/10">
                {replyTo && (
                    <div className="mb-4 px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between group">
                        <span className="text-[10px] text-blue-300 font-black uppercase tracking-widest flex items-center gap-3">
                            <Reply className="size-3 group-hover:rotate-12 transition-transform" />
                            Transmitting response to <span className="text-white">{replyTo.userId?.name}</span>
                        </span>
                        <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                )}
                {replyTo?.status === 'closed' ? (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Closed Discourse: Replies restricted to Strategic Leads</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="relative group">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={replyTo ? "Synthesize your response..." : "Ask a curriculum question or share a neural insight..."}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-[2rem] p-6 pr-20 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all resize-none h-32 no-scrollbar"
                        />
                        <button 
                            type="submit"
                            disabled={submitting || !newMessage.trim()}
                            className="absolute bottom-6 right-6 size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20"
                        >
                            <Send className="size-6" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DiscussionSystem;



