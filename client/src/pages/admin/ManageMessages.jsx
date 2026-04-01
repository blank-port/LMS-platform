import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Send, Search, User as UserIcon, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import Pusher from 'pusher-js';

const ManageMessages = () => {
    const { backendUrl, getHeaders, user, settings } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [totalMessages, setTotalMessages] = useState(0);
    const [skip, setSkip] = useState(0);
    const limit = 50;
    const { pusher_app_key, pusher_active, pusher_cluster } = settings;
    const chatEndRef = useRef(null);

    const fetchMessages = async (append = false) => {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/messages`, {
                params: { limit, skip: append ? messages.length : 0 },
                ...getHeaders()
            });
            if (data.success) {
                if (append) setMessages([...messages, ...data.messages]);
                else setMessages(data.messages);
                setTotalMessages(data.total);
            }
        } catch (error) {
            toast.error('Strategic Relay Synchronization Failure');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const { data } = await axios.post(`${backendUrl}/api/comm/messages`, {
                receiverId: selectedUser._id,
                content: newMessage
            }, getHeaders());
            
            if (data.success) {
                setMessages([data.data, ...messages]);
                setNewMessage('');
            }
        } catch (error) {
            toast.error('Dispatch Failure');
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    // Strategic Real-time Relay (Module 5: Notifications)
    useEffect(() => {
        if (!pusher_app_key || !pusher_active || !user?._id) return;

        const pusher = new Pusher(pusher_app_key, {
            cluster: pusher_cluster || 'ap2',
            forceTLS: true
        });

        const channel = pusher.subscribe(`user-${user._id}`);
        channel.bind('new-message', (data) => {
            // Re-fetch contextually relevant discourse
            fetchMessages(); 
        });

        return () => {
            pusher.disconnect();
        };
    }, [user, pusher_app_key, pusher_active, pusher_cluster]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedUser]);

    // Unique participants for sidebar
    const participants = Array.from(new Set(messages.flatMap(m => [m.sender, m.receiver])))
        .filter(p => p?._id !== user?._id && p?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentChat = messages.filter(m => 
        (m.sender?._id === selectedUser?._id && m.receiver?._id === user?._id) ||
        (m.sender?._id === user?._id && m.receiver?._id === selectedUser?._id)
    ).reverse();

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Encrypted Relay...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto h-[80vh] flex overflow-hidden rounded-[3.5rem] border border-gray-100 shadow-2xl bg-white animate-in fade-in duration-700">
            {/* Conversations Sidebar */}
            <div className="w-96 border-r border-gray-50 flex flex-col bg-gray-50/30">
                <div className="p-8 space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Strategic Relay</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search Scholars..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl h-12 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-10">
                    {participants.map((p) => (
                        <button 
                            key={p._id} 
                            onClick={() => setSelectedUser(p)}
                            className={`w-full p-6 rounded-[2.5rem] flex items-center gap-4 transition-all ${selectedUser?._id === p._id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'hover:bg-white'}`}
                        >
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border-2 ${selectedUser?._id === p._id ? 'bg-white/20 border-white/20 text-white' : 'bg-indigo-50 border-white text-indigo-400'}`}>
                                    {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover rounded-2xl" /> : p.name?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-black truncate tracking-tight">{p.name}</p>
                                <p className={`text-[9px] font-bold uppercase tracking-widest truncate mt-0.5 ${selectedUser?._id === p._id ? 'text-white/60' : 'text-gray-400'}`}>{p.role} Node</p>
                            </div>
                        </button>
                    ))}

                    {messages.length < totalMessages && (
                        <button 
                            onClick={() => fetchMessages(true)}
                            disabled={loadingMore}
                            className="w-full py-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 rounded-2xl transition-all"
                        >
                            {loadingMore ? 'Syncing...' : 'Load Archived Discourse'}
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col relative bg-white">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 text-xl font-black border border-indigo-100">
                                    {selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full object-cover rounded-2xl" /> : selectedUser.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">{selectedUser.name}</h3>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">Encryption Protocol Active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"><Phone size={18} /></button>
                                <button className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"><Video size={18} /></button>
                                <button className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/20">
                            {currentChat.map((m, i) => (
                                <div key={m._id || i} className={`flex ${m.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] group`}>
                                        <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                                            m.sender?._id === user?._id 
                                                ? 'bg-gray-900 text-white rounded-tr-none' 
                                                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                        }`}>
                                            {m.content}
                                        </div>
                                        <p className={`text-[8px] font-black uppercase tracking-widest mt-3 opacity-0 group-hover:opacity-100 transition-opacity ${m.sender?._id === user?._id ? 'text-right pr-2' : 'text-left pl-2'}`}>
                                            Delivered • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-8 border-t border-gray-50">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                                <button type="button" className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400"><Paperclip size={18} /></button>
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="Type strategic signal..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-8 text-sm font-medium text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300"
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-400"><Smile size={18} /></button>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20 bg-gray-50/10">
                        <div className="text-9xl rotate-12">🛰️</div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Relay Standby</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Select a communication node to synchronize.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMessages;
