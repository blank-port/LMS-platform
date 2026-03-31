import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageCommunication = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [comments, setComments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('comments');

    const fetchData = async () => {
        try {
            if (tab === 'comments') {
                const { data } = await axios.get(`${backendUrl}/api/comm/comments?targetType=Course`, getHeaders());
                if (data.success) setComments(data.comments);
            } else {
                const { data } = await axios.get(`${backendUrl}/api/comm/messages`, getHeaders());
                if (data.success) setMessages(data.messages);
            }
        } catch (error) {
            toast.error('Strategic Intelligence Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Strategic Nexus...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Strategic Engagement Nexus</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Global Communication Oversight & Engagement Intelligence Hub</p>
                </div>
                <div className="flex bg-[var(--background)] p-1.5 rounded-2xl border border-[var(--border)] shadow-inner">
                    <button 
                        onClick={() => setTab('comments')} 
                        className={`h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'comments' ? 'bg-[var(--surface)] text-purple-400 shadow-xl shadow-purple-50' : 'text-gray-400 hover:text-[var(--text-muted)]'}`}
                    >
                        Intel Block (Comments)
                    </button>
                    <button 
                        onClick={() => setTab('messages')} 
                        className={`h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'messages' ? 'bg-[var(--surface)] text-purple-400 shadow-xl shadow-purple-50' : 'text-gray-400 hover:text-[var(--text-muted)]'}`}
                    >
                        Secure Relay (Messages)
                    </button>
                </div>
            </div>

            {/* Content Hub */}
            <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]/30">
                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">
                        {tab === 'comments' ? 'Global Interaction Feed' : 'Authorization Secure Relay'}
                    </h3>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic tracking-widest">
                            {tab === 'comments' ? comments.length : messages.length} ACTIVE THREADS
                        </span>
                    </div>
                </div>

                <div className="p-10">
                    {tab === 'comments' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {comments.map(c => (
                                <div key={c._id} className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-6xl group-hover:scale-110 transition-transform">💬</div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-[11px] font-black text-purple-400">
                                            {c.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-[var(--text-main)] text-sm tracking-tight">{c.user?.name}</p>
                                            <span className="text-[9px] font-black bg-[var(--background)] text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest">{c.targetType} Asset</span>
                                        </div>
                                    </div>
                                    <p className="text-[var(--text-muted)] text-sm leading-relaxed italic">"{c.content}"</p>
                                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-[var(--border)]">
                                        <button className="text-[9px] font-black text-purple-400 uppercase tracking-widest hover:underline underline-offset-4">Respond to Intel</button>
                                        <button className="text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-red-500 transition-colors">Dismiss</button>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <div className="col-span-full py-24 text-center">
                                    <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 rotate-12">💬</div>
                                    <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Interaction Void</h3>
                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No strategic engagements detected in the nexus.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map(m => (
                                <div key={m._id} className="p-8 hover:bg-[var(--background)]/50 flex justify-between items-center rounded-3xl border border-[var(--border)] transition-all group hover:scale-[1.01] cursor-pointer">
                                    <div className="flex items-center gap-10">
                                        <div className="flex -space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black border-4 border-white">S</div>
                                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black border-4 border-white">R</div>
                                        </div>
                                        <div>
                                            <p className="font-black text-[var(--text-main)] text-sm tracking-tight uppercase group-hover:text-purple-400 transition-colors">Target: {m.receiver?.name || 'Authorized Scholar'}</p>
                                            <p className="text-xs text-gray-400 font-bold mt-1 line-clamp-1 italic max-w-lg">"{m.content}"</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">{new Date(m.createdAt).toLocaleDateString()}</span>
                                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-[0.2em] italic">Encrypted Relay</span>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 italic">e</div>
                                    <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Relay Silence</h3>
                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No secure communications detected in the relay channel.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCommunication;

