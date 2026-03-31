import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstructorCommunication = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [comments, setComments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [view, setView] = useState('messages'); // 'messages', 'discussions', or 'notices'
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', recipients: 'all', course: '' });
    const [newMessage, setNewMessage] = useState({ receiver: '', content: '' });
    const [enrolledStudents, setEnrolledStudents] = useState([]);

    const fetchCommunication = async () => {
        try {
            const msgRes = await axios.get(`${backendUrl}/api/comm/messages`, { headers: { Authorization: `Bearer ${token}` } });
            if (msgRes.data.success) setMessages(msgRes.data.messages);

            const commRes = await axios.get(`${backendUrl}/api/comm/comments`);
            if (commRes.data.success) setComments(commRes.data.comments);

            const noticeRes = await axios.get(`${backendUrl}/api/comm/instructor-notices`, { headers: { Authorization: `Bearer ${token}` } });
            if (noticeRes.data.success) setNotices(noticeRes.data.notices);

            const courseRes = await axios.get(`${backendUrl}/api/instructor/courses`, { headers: { Authorization: `Bearer ${token}` } });
            if (courseRes.data.success) setInstructorCourses(courseRes.data.courses);

            const studentRes = await axios.get(`${backendUrl}/api/instructor/enrolled-students`, { headers: { Authorization: `Bearer ${token}` } });
            if (studentRes.data.success) setEnrolledStudents(studentRes.data.enrolledStudents);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/comm/send`, newMessage, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success('Signal transmitted');
                setIsMessageModalOpen(false);
                setNewMessage({ receiver: '', content: '' });
                fetchCommunication();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handlePostNotice = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/comm/notice`, newNotice, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success('Notice dispatched successfully');
                setIsNoticeModalOpen(false);
                setNewNotice({ title: '', content: '', recipients: 'all', course: '' });
                fetchCommunication();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const viewParam = params.get('view');
        const studentParam = params.get('student');

        if (viewParam) setView(viewParam);
        if (studentParam) {
            setNewMessage(prev => ({ ...prev, receiver: studentParam }));
            setIsMessageModalOpen(true);
        }
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
                    <button
                        onClick={() => setView('messages')}
                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'messages' ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Direct Messages
                    </button>
                    <button
                        onClick={() => setView('discussions')}
                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'discussions' ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Course Discussions
                    </button>
                    <button
                        onClick={() => setView('notices')}
                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'notices' ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Official Notices
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-5">
                {view === 'messages' ? (
                    <div className="p-10 md:p-16">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-[#0C132B] tracking-tight">Direct Signals</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Private synchronization threads with scholars</p>
                            </div>
                            <button
                                onClick={() => setIsMessageModalOpen(true)}
                                className="px-8 py-4 bg-[#0C132B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-indigo-600 transition-all"
                            >
                                Compose New Signal
                            </button>
                        </div>
                        {messages.length === 0 ? (
                            <div className="text-center py-32">
                                <div className="text-7xl mb-10 opacity-10 grayscale">📫</div>
                                <h3 className="text-2xl font-black text-[#0C132B] mb-4 tracking-tight">Signals are Quiet</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No direct student signals detected in your synchronization layer yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {messages.map(m => (
                                    <div key={m._id} className="p-8 rounded-[2rem] bg-gray-50/50 border border-gray-50 hover:bg-white hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#0C132B] text-white rounded-xl flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                                                    {m.sender.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-[#0C132B] tracking-tight group-hover:text-indigo-500 transition-colors uppercase">{m.sender.name}</span>
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Signal</span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest group-hover:text-[#0C132B] transition-colors">{new Date(m.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-2xl">{m.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : view === 'discussions' ? (
                    <div className="p-10 md:p-16">
                        {comments.length === 0 ? (
                            <div className="text-center py-32">
                                <div className="text-7xl mb-10 opacity-10 grayscale">🗨️</div>
                                <h3 className="text-2xl font-black text-[#0C132B] mb-4 tracking-tight">Zero Network Activity</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">The discussion clusters across your modules are currently inactive.</p>
                            </div>
                        ) : (
                            <div className="grid gap-10 divide-y divide-gray-50">
                                {comments.map(c => (
                                    <div key={c._id} className="pt-10 first:pt-0 group animate-in slide-in-from-left-5">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                                {c.userName ? c.userName.charAt(0).toUpperCase() : 'AN'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#0C132B] tracking-tight group-hover:text-indigo-500 transition-colors">{c.userName || 'Anonymous Scholar'}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Interacting on <span className="text-emerald-500">{c.type}</span></span>
                                            </div>
                                        </div>
                                        <div className="pl-16">
                                            <p className="text-sm font-bold text-gray-600 leading-relaxed mb-6 max-w-3xl">{c.commentBody}</p>
                                            <div className="flex gap-8">
                                                <button className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] hover:text-[#0C132B] transition-all flex items-center gap-2 group-hover:translate-x-1 duration-300">
                                                    Initialize Response →
                                                </button>
                                                <button className="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em] hover:text-rose-500 transition-all">Flag Conflict</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-10 md:p-16">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-[#0C132B] tracking-tight">Active Broadcasts</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status of your intellectual transmissions</p>
                            </div>
                            <button
                                onClick={() => setIsNoticeModalOpen(true)}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                            >
                                Dispatch New Notice
                            </button>
                        </div>

                        {notices.length === 0 ? (
                            <div className="text-center py-32">
                                <div className="text-7xl mb-10 opacity-10 grayscale">📢</div>
                                <h3 className="text-2xl font-black text-[#0C132B] mb-4 tracking-tight">Static on the Line</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No administrative broadcasts have been issued across the platform spectrum yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {notices.map(n => (
                                    <div key={n._id} className="p-8 rounded-[2rem] bg-gray-50/5 border border-gray-100/50 hover:bg-gray-50/10 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-[#0C132B] tracking-tight">{n.title}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${n.recipients === 'all' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {n.recipients === 'all' ? 'Global Broadcast' : `Module: ${n.course?.courseTitle || 'Specific'}`}
                                                    </span>
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 leading-relaxed">{n.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Notice Modal */}
            {isNoticeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-[#0C132B]/60 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                        <div className="p-10 md:p-12 border-b border-gray-100 bg-gray-50/30">
                            <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter">Issue Platform Signal</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Broadcast directives to the scholar network</p>
                        </div>
                        <form onSubmit={handlePostNotice} className="p-10 md:p-12 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Notice Headline</label>
                                <input
                                    required
                                    type="text"
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0C132B] focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="e.g. Critical System Update"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Protocol</label>
                                    <select
                                        value={newNotice.recipients}
                                        onChange={(e) => setNewNotice({ ...newNotice, recipients: e.target.value })}
                                        className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-[#0C132B] focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                    >
                                        <option value="all">Global Broadcast</option>
                                        <option value="course">Module Specific</option>
                                    </select>
                                </div>
                                {newNotice.recipients === 'course' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Module</label>
                                        <select
                                            required
                                            value={newNotice.course}
                                            onChange={(e) => setNewNotice({ ...newNotice, course: e.target.value })}
                                            className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-[#0C132B] focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                        >
                                            <option value="">Select Module</option>
                                            {instructorCourses.map(c => (
                                                <option key={c._id} value={c._id}>{c.courseTitle}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Signal Content</label>
                                <textarea
                                    required
                                    value={newNotice.content}
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                    className="w-full h-48 p-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0C132B] focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                    placeholder="Enter directive details..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 h-16 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 hover:bg-[#0C132B] transition-all"
                                >
                                    Authorize Broadcast
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsNoticeModalOpen(false)}
                                    className="px-10 h-16 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-rose-500 transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {isMessageModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-[#0C132B]/60 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                        <div className="p-10 md:p-12 border-b border-gray-100 bg-gray-50/30">
                            <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter">Initialize Private Sync</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Establish a direct encrypted-style channel with a scholar</p>
                        </div>
                        <form onSubmit={handleSendMessage} className="p-10 md:p-12 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Scholar</label>
                                <select
                                    required
                                    value={newMessage.receiver}
                                    onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
                                    className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-[#0C132B] focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="">Select Target</option>
                                    {/* Deduplicate students if they are in multiple courses */}
                                    {Array.from(new Set(enrolledStudents.map(s => s.student?._id)))
                                        .map(studentId => {
                                            const s = enrolledStudents.find(st => st.student?._id === studentId);
                                            return <option key={studentId} value={studentId}>{s.student?.name} ({s.student?.email})</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transmission Content</label>
                                <textarea
                                    required
                                    value={newMessage.content}
                                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                    className="w-full h-48 p-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0C132B] focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                    placeholder="Enter private directive..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 h-16 bg-[#0C132B] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-indigo-600 transition-all"
                                >
                                    Transmit Signal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsMessageModalOpen(false)}
                                    className="px-10 h-16 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-rose-500 transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorCommunication;
