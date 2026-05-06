import React, { useState, useEffect, useContext } from 'react';
import api from '@/utils/api';
import { AppContext } from '@/context/AppContextObject.jsx';
import { toast } from 'react-toastify';
import { Bell, Plus, Trash2, Megaphone, Calendar, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NoticeBoard = ({ courseId, cohortId, mode = 'view' }) => {
    const { user } = useContext(AppContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        priority: 'normal',
        recipients: cohortId ? 'cohort' : 'course',
        expiryDate: ''
    });

    const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

    useEffect(() => {
        fetchNotices();
    }, [courseId, cohortId]);

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/notice/fetch', { params: { courseId, cohortId } });
            if (data.success) {
                setNotices(data.notices);
            }
        } catch (error) {
            console.error('Failed to load notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/notice/create', {
                ...form,
                course: courseId,
                cohort: cohortId
            });
            if (data.success) {
                toast.success('Announcement broadcasted');
                setShowCreate(false);
                setForm({ title: '', content: '', priority: 'normal', recipients: cohortId ? 'cohort' : 'course', expiryDate: '' });
                fetchNotices();
            }
        } catch (error) {
            toast.error('Failed to broadcast');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Decommission this announcement?')) return;
        try {
            await api.delete(`/notice/${id}`);
            toast.success('Announcement removed');
            fetchNotices();
        } catch (error) {
            toast.error('Strategic failure');
        }
    };

    const PriorityBadge = ({ priority }) => {
        const styles = {
            normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            urgent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            critical: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${styles[priority] || styles.normal}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="bg-[#0f1014] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Bell className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">Board of Notices</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Institutional Announcements</p>
                    </div>
                </div>
                {isInstructor && mode === 'manage' && (
                    <button 
                        onClick={() => setShowCreate(!showCreate)}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                    >
                        <Plus className="size-5" />
                    </button>
                )}
            </div>

            {showCreate && isInstructor && (
                <div className="p-6 bg-blue-500/5 border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                            required
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-bold"
                        />
                        <textarea
                            placeholder="Write the announcement content..."
                            value={form.content}
                            onChange={e => setForm({...form, content: e.target.value})}
                            required
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all h-24 resize-none"
                        />
                        <div className="flex flex-wrap gap-4">
                            <select 
                                value={form.priority}
                                onChange={e => setForm({...form, priority: e.target.value})}
                                className="bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/50"
                            >
                                <option value="normal" className="bg-[#1a1c22]">Normal Priority</option>
                                <option value="urgent" className="bg-[#1a1c22]">Urgent</option>
                                <option value="critical" className="bg-[#1a1c22]">Critical</option>
                            </select>
                            <input
                                type="date"
                                value={form.expiryDate}
                                onChange={e => setForm({...form, expiryDate: e.target.value})}
                                className="bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/50"
                            />
                            <button type="submit" className="flex-1 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
                                <Megaphone className="size-4" />
                                Broadcast Now
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block size-8 border-2 border-t-amber-500 border-white/10 rounded-full animate-spin"></div>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <Megaphone className="size-12 text-white/10 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No signals from the institution yet.</p>
                    </div>
                ) : (
                    notices.map(notice => (
                        <div key={notice._id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full overflow-hidden border border-white/10">
                                        <img src={notice.instructor?.profilePicture} alt="" className="size-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white">{notice.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                            <span>{notice.instructor?.name}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>
                                <PriorityBadge priority={notice.priority} />
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {notice.content}
                            </p>
                            {isInstructor && mode === 'manage' && (
                                <button 
                                    onClick={() => handleDelete(notice._id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all p-2 text-slate-500 hover:text-red-400"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;


