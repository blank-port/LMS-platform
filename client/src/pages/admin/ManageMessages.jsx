import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageMessages = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/communication/messages`, getHeaders());
            if (data.success) setMessages(data.messages);
        } catch (error) {
            toast.error('Communication Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aggregating Intelligence Streams...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Intelligence Communication Hub</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Inter-Departmental Messaging & Strategic Signal Monitoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Message Sidebar */}
                <div className="lg:col-span-1 bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] overflow-hidden h-[70vh] flex flex-col">
                    <div className="p-8 border-b border-[var(--border)]">
                        <input type="text" placeholder="Search Signal Streams..." className="w-full px-6 py-4 bg-[var(--background)] border-none rounded-2xl text-[11px] font-black uppercase tracking-widest placeholder:text-gray-300 outline-none" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {messages.map(msg => (
                            <button key={msg._id} onClick={() => setSelectedMessage(msg)} className={`w-full p-6 rounded-[2rem] text-left transition-all flex items-start gap-4 ${selectedMessage?._id === msg._id ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'hover:bg-[var(--background)]'}`}>
                                <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-[var(--text-main)]">{msg.sender?.name?.charAt(0)}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-black tracking-tight truncate ${selectedMessage?._id === msg._id ? 'text-white' : 'text-[var(--text-main)]'}`}>{msg.subject || 'Institutional Signal'}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-1 ${selectedMessage?._id === msg._id ? 'text-purple-100' : 'text-gray-400'}`}>{msg.sender?.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2 bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] overflow-hidden flex flex-col">
                    {selectedMessage ? (
                        <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-500">
                            <div className="p-10 border-b border-[var(--border)] flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">{selectedMessage.subject || 'Direct Signal'}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Protocol ID: {selectedMessage._id}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">✕</button>
                                </div>
                            </div>
                            <div className="p-10 flex-1 overflow-y-auto space-y-8">
                                <div className="flex items-center gap-4 p-6 bg-[var(--background)]/50 rounded-[2rem] border border-[var(--border)]">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-400 font-black">
                                        {selectedMessage.sender?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[var(--text-main)]">{selectedMessage.sender?.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authorized Source</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                                </div>
                            </div>
                            <div className="p-8 border-t border-[var(--border)]">
                                <button className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 shadow-xl transition-all">Initialize Response Protocol</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 space-y-6 opacity-20">
                            <div className="text-9xl rotate-12">📨</div>
                            <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Signal Standby</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Select a stream to initiate intelligence review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageMessages;
