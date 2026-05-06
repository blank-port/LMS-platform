import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    MessageSquare, Send, Search, Filter, 
    MoreVertical, Bell, Megaphone, Trash2, 
    Calendar, Clock, AlertTriangle, Info,
    Plus, X, ShieldAlert, CheckCircle, ChevronRight
} from 'lucide-react';
import NexusChat from '../../components/common/NexusChat.jsx';
import { format } from 'date-fns';

const InstructorCommunication = () => {
    const [messages, setMessages] = useState([]);
    const [comments, setComments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('messages');
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ 
        title: '', 
        content: '', 
        course: '', 
        recipients: 'course',
        priority: 'normal',
        expiryDate: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCommunication = async () => {
        try {
            const noticeRes = await api.get('/comm/instructor-notices');
            if (noticeRes.data.success) setNotices(noticeRes.data.notices);

            const courseRes = await api.get('/instructor/courses');
            if (courseRes.data.success) setInstructorCourses(courseRes.data.courses);

            const commRes = await api.get('/comm/comments');
            if (commRes.data.success) setComments(commRes.data.comments);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteNotice = async (id) => {
        try {
            await api.delete(`/comm/notices/${id}`);
            toast.success('Notice removed');
            fetchCommunication();
        } catch (error) {
            toast.error('Failed to remove notice');
        }
    };

    const handlePostNotice = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/comm/notices', newNotice);
            if (data.success) {
                toast.success('Notice dispatched successfully');
                setShowNoticeModal(false);
                setNewNotice({ title: '', content: '', recipients: 'course', course: '', priority: 'normal', expiryDate: '' });
                fetchCommunication();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const viewParam = params.get('view');
        if (viewParam) setActiveTab(viewParam);
    }, [location.search]);

    useEffect(() => { fetchCommunication(); }, []);

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Engagement Hub</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Communications</h1>
                </div>

                <div className="flex gap-2 bg-white p-2 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50">
                    <button onClick={() => setActiveTab('messages')} className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}>Nexus Chat</button>
                    <button onClick={() => setActiveTab('notices')} className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notices' ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}>Notices</button>
                    <button onClick={() => setActiveTab('discussions')} className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'discussions' ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}>Discussions</button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden min-h-[600px] p-6 lg:p-10">
                {activeTab === 'messages' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <NexusChat panel="educator" />
                    </div>
                )}

                {activeTab === 'notices' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Institutional Alerts</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Broadcast mission-critical updates to scholar cohorts</p>
                            </div>
                            <button 
                                onClick={() => setShowNoticeModal(true)}
                                className="px-8 py-4 bg-[#0C132B] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10 flex items-center gap-3"
                            >
                                <Plus size={16} /> Deploy New Notice
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {notices.length === 0 ? (
                                <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center grayscale opacity-20">
                                    <Bell size={64} className="mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No active notices found in this sector.</p>
                                </div>
                            ) : (
                                notices.map((notice) => (
                                    <div key={notice._id} className={`group bg-white p-8 rounded-[3rem] border border-gray-50 shadow-2xl shadow-gray-200/40 hover:shadow-indigo-100/50 transition-all hover:scale-[1.02] relative overflow-hidden ${
                                        notice.priority === 'critical' ? 'ring-2 ring-rose-500/20' : 
                                        notice.priority === 'urgent' ? 'ring-2 ring-amber-500/20' : ''
                                    }`}>
                                        {/* Priority Indicator */}
                                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-[1.5rem] text-[8px] font-black uppercase tracking-widest ${
                                            notice.priority === 'critical' ? 'bg-rose-500 text-white animate-pulse' : 
                                            notice.priority === 'urgent' ? 'bg-amber-500 text-white' : 'bg-indigo-50 text-indigo-400'
                                        }`}>
                                            {notice.priority}
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                                notice.priority === 'critical' ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                                <Bell size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{notice.recipients === 'all' ? 'Universal Broadcast' : 'Curriculum Node'}</p>
                                                <h3 className="font-black text-lg text-gray-900 tracking-tight line-clamp-1">{notice.title}</h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-3 mb-8">{notice.content}</p>
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="text-gray-300" />
                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                    {format(new Date(notice.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {notice.expiryDate && (
                                                    <div className="flex items-center gap-2 text-rose-400">
                                                        <Clock size={12} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Exp: {format(new Date(notice.expiryDate), 'MMM dd')}</span>
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteNotice(notice._id)}
                                                    className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'discussions' && (
                    <div className="grid gap-10 divide-y divide-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {comments.length === 0 ? (
                            <div className="text-center py-40 grayscale opacity-20 filter">
                                <MessageSquare size={64} className="mx-auto mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Active Discourse Nodes</p>
                            </div>
                        ) : (
                            comments.map(c => (
                                <div key={c._id} className="pt-10 first:pt-0 group hover:translate-x-2 transition-transform">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl font-black text-indigo-500 shadow-lg border border-white">
                                            {c.userName ? c.userName.charAt(0).toUpperCase() : 'AN'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-[#0C132B] tracking-tight group-hover:text-indigo-600 transition-colors">{c.userName || 'Anonymous Scholar'}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module Segment: <span className="text-emerald-500">{c.type}</span></span>
                                        </div>
                                    </div>
                                    <div className="pl-20">
                                        <div className="bg-gray-50 p-8 rounded-[2.5rem] rounded-tl-none border border-gray-100">
                                            <p className="text-sm font-bold text-gray-600 leading-relaxed max-w-4xl">{c.commentBody}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {showNoticeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-[#0C132B]/60 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                            <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter">Issue Platform Signal</h2>
                            <button onClick={() => setShowNoticeModal(false)} className="w-12 h-12 bg-white text-gray-300 rounded-2xl flex items-center justify-center hover:text-rose-500 transition-all shadow-xl shadow-gray-200/20">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePostNotice} className="p-10 space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 mb-3 block">Notice Headline</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 outline-none text-xs font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                    placeholder="Brief summary of the directive..."
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Criticality Level</label>
                                    <div className="flex gap-2">
                                        {['normal', 'urgent', 'critical'].map(p => (
                                            <button 
                                                key={p}
                                                type="button"
                                                onClick={() => setNewNotice({...newNotice, priority: p})}
                                                className={`flex-1 py-4 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 transition-all ${
                                                    newNotice.priority === p 
                                                    ? 'bg-[#0C132B] text-white border-transparent shadow-lg' 
                                                    : 'bg-white text-gray-400 border-gray-50 hover:border-indigo-100'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Protocol Expiry</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-gray-50 px-8 py-4 rounded-xl border border-gray-100 outline-none text-[10px] font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                        value={newNotice.expiryDate}
                                        onChange={(e) => setNewNotice({...newNotice, expiryDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Target Cluster</label>
                                <select 
                                    className="w-full bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 outline-none text-xs font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                    value={newNotice.recipients}
                                    onChange={(e) => setNewNotice({ ...newNotice, recipients: e.target.value })}
                                >
                                    <option value="course">Curriculum Cohort</option>
                                    <option value="all">Universal Broadcast</option>
                                </select>
                            </div>

                            {newNotice.recipients === 'course' && (
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Select Curriculum Node</label>
                                    <select 
                                        required
                                        className="w-full bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 outline-none text-xs font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                        value={newNotice.course}
                                        onChange={(e) => setNewNotice({ ...newNotice, course: e.target.value })}
                                    >
                                        <option value="">Destinations...</option>
                                        {instructorCourses.map(c => (
                                            <option key={c._id} value={c._id}>{c.courseTitle}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Transmission Payload</label>
                                <textarea 
                                    rows="5"
                                    required
                                    className="w-full bg-gray-50 px-8 py-6 rounded-[2rem] border border-gray-100 outline-none text-sm font-bold text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all resize-none shadow-inner"
                                    placeholder="Enter full directive details..."
                                    value={newNotice.content}
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 hover:bg-[#0C132B] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Transmitting Data...' : 'Authorize Broadcast'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorCommunication;




