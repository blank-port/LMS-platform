import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageCircle, Send, User, BookOpen, Clock, Award, Star, CheckCircle } from 'lucide-react';

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

    const toggleGoldenKnowledge = async (id) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/comm/qa/${id}/golden`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                fetchQuestions();
            }
        } catch (err) {
            toast.error('Failed to seal discourse as Golden Knowledge');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-50/30">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Knowledge Curation</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Curriculum QA</h1>
                    <p className="text-sm font-medium text-gray-400 mt-3">Synthesize and verify scholarship inquiries across your modules.</p>
                </div>
                <div className="flex bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-50">
                    <div className="px-6 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest border-r border-gray-100 flex items-center gap-2">
                        <MessageCircle size={14} /> {questions.length} Active Nodes
                    </div>
                    <div className="px-6 py-3 text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <Award size={14} /> {questions.filter(q => q.isGoldenKnowledge).length} Golden Pins
                    </div>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="bg-white p-32 rounded-[4rem] border border-dashed border-gray-100 text-center max-w-3xl mx-auto shadow-2xl">
                    <div className="text-8xl mb-10 grayscale opacity-10">🧠</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Synapse Silent</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">The collective scholar consciousness is currently in observation mode.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {questions.map((q) => (
                        <div key={q._id} className={`bg-white rounded-[3.5rem] border overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700 group/card relative ${
                            q.isGoldenKnowledge ? 'border-amber-200 ring-4 ring-amber-500/5' : 'border-gray-50'
                        }`}>
                            {q.isGoldenKnowledge && (
                                <div className="absolute top-0 right-0 px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-bl-[2.5rem] flex items-center gap-3 shadow-xl animate-in slide-in-from-right-10 duration-700">
                                    <Award size={18} className="animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Verified Knowledge Node</span>
                                </div>
                            )}

                            <div className="p-10 lg:p-14">
                                <div className="flex items-start gap-8">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-2xl border-4 border-white flex-shrink-0 mt-1 transition-transform group-hover/card:scale-105 duration-500 ${
                                        q.userId?.profilePicture ? '' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-500'
                                    }`}>
                                        {q.userId?.profilePicture ? (
                                            <img src={q.userId.profilePicture} className="w-full h-full rounded-[2rem] object-cover" alt="" />
                                        ) : (
                                            q.userId?.name?.charAt(0)?.toUpperCase() || 'S'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">{q.userId?.name || 'Anonymous Scholar'}</h3>
                                            <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/50 px-4 py-1.5 rounded-xl">
                                                <BookOpen size={12} className="text-indigo-400" />
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{q.courseId?.courseTitle || 'Sector Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/50 p-8 rounded-[2.5rem] rounded-tl-none border border-gray-100 mb-8">
                                            <p className="text-lg font-medium text-gray-700 leading-relaxed italic">"{q.message}"</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 flex-wrap gap-4">
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(q.createdAt), 'MMM dd, HH:mm')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-indigo-400">
                                                    <MessageCircle size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{q.replyCount} Synchronized Replies</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleGoldenKnowledge(q._id)}
                                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-500 ${
                                                        q.isGoldenKnowledge 
                                                        ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' 
                                                        : 'bg-white border border-gray-100 text-gray-400 hover:border-amber-300 hover:text-amber-500'
                                                    }`}
                                                >
                                                    <Star size={14} fill={q.isGoldenKnowledge ? 'currentColor' : 'none'} />
                                                    {q.isGoldenKnowledge ? 'Pin Verified' : 'Seal as Golden'}
                                                </button>
                                                <button
                                                    onClick={() => { setReplyingTo(replyingTo === q._id ? null : q._id); setReplyText(''); }}
                                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-500 ${
                                                        replyingTo === q._id 
                                                        ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                                                        : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-[#0C132B]'
                                                    }`}
                                                >
                                                    {replyingTo === q._id ? <X size={14} /> : <Send size={14} />}
                                                    {replyingTo === q._id ? 'Abort Sync' : 'Transmit Reply'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Protocol */}
                                {replyingTo === q._id && (
                                    <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-end gap-6 bg-gray-50 p-8 rounded-[3rem] border border-indigo-100/50 shadow-inner">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block ml-4">Strategic Response Transmission</label>
                                                <textarea
                                                    className="w-full bg-white border border-gray-100 rounded-2xl p-6 text-sm font-medium text-gray-800 outline-none focus:ring-4 focus:ring-indigo-500/5 resize-none min-h-[120px] transition-all"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Synthesize your directive here..."
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleReply(q._id)}
                                                disabled={!replyText.trim()}
                                                className="w-20 h-20 bg-indigo-600 text-white rounded-3xl hover:bg-emerald-500 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl flex items-center justify-center group/btn"
                                            >
                                                <Send size={28} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
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
