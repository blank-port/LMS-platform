import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageCircle, Send, User, BookOpen, Clock } from 'lucide-react';

const InstructorQA = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const fetchQuestions = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/qa`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setQuestions(data.questions);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchQuestions(); }, []);

    const handleReply = async (questionId) => {
        if (!replyText.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/instructor/qa/reply`,
                { questionId, message: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Reply sent successfully');
                setReplyingTo(null);
                setReplyText('');
                fetchQuestions();
            }
        } catch (err) {
            toast.error('Failed to send reply');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Communication</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Q&A - Question List</h1>
                <p className="text-sm font-medium text-gray-400 mt-2">Questions from students on your courses</p>
            </div>

            {questions.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-100 text-center max-w-2xl mx-auto">
                    <div className="text-6xl mb-6 opacity-10">💬</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No Questions Yet</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Students haven't asked any questions on your courses yet</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {questions.map((q) => (
                        <div key={q._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="p-7">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-sm font-black flex-shrink-0 mt-0.5">
                                        {q.userId?.profilePicture ? (
                                            <img src={q.userId.profilePicture} className="w-full h-full rounded-xl object-cover" alt="" />
                                        ) : (
                                            q.userId?.name?.charAt(0)?.toUpperCase() || '?'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <span className="text-sm font-black text-gray-900">{q.userId?.name || 'Anonymous'}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <BookOpen size={10} /> {q.courseId?.courseTitle || 'Unknown Course'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{q.message}</p>
                                        <div className="flex items-center gap-6 mt-4">
                                            <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1">
                                                <Clock size={11} /> {new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1">
                                                <MessageCircle size={11} /> {q.replyCount} replies
                                            </span>
                                            <button
                                                onClick={() => { setReplyingTo(replyingTo === q._id ? null : q._id); setReplyText(''); }}
                                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                                            >
                                                {replyingTo === q._id ? 'Cancel' : 'Reply'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Box */}
                                {replyingTo === q._id && (
                                    <div className="mt-5 ml-15 pl-6 border-l-2 border-indigo-100">
                                        <div className="flex items-end gap-3">
                                            <textarea
                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-100 resize-none min-h-[80px] transition-all"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply..."
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleReply(q._id)}
                                                disabled={!replyText.trim()}
                                                className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstructorQA;
