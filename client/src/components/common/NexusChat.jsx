import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    Send, Search, User as UserIcon, Shield, 
    MoreVertical, Paperclip, Smile, Check, 
    CheckCheck, Globe, Users, Megaphone, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Pusher from 'pusher-js';

const NexusChat = ({ panel = 'student' }) => {
    const { token, user, settings } = useContext(AppContext);
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null); // { contact, lastMessage, isOnline }
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [globalUsers, setGlobalUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [instructorCourses, setInstructorCourses] = useState([]);
    const chatEndRef = useRef(null);

    const selectedContactRef = useRef(selectedContact);

    useEffect(() => {
        selectedContactRef.current = selectedContact;
    }, [selectedContact]);

    // Pusher Subscription
    useEffect(() => {
        if (!token || !user?._id || !settings?.pusher_app_key) return;

        const pusher = new Pusher(settings.pusher_app_key, {
            cluster: settings.pusher_cluster || 'ap2',
            forceTLS: true
        });

        const channel = pusher.subscribe(`chat-${user._id}`);
        
        channel.bind('new-message', (data) => {
            const currentSelected = selectedContactRef.current;
            if (!data) return;

            // 1. If message is from/to the currently selected contact, add to messages list
            if (currentSelected && (data.sender?._id === currentSelected.contact?._id || data.receiver?._id === currentSelected.contact?._id)) {
                setMessages(prev => {
                    // Avoid duplicates and nulls
                    if (prev.find(m => m && m._id === data._id)) return prev;
                    return [...prev, data];
                });
                
                // If I am the receiver, mark as read
                if (data.receiver?._id === user?._id) {
                    markMessagesAsRead(currentSelected.contact._id);
                }
            }

            // 2. Refresh conversation list to show last message
            fetchConversations();
        });

        return () => {
            pusher.unsubscribe(`chat-${user._id}`);
            pusher.disconnect();
        };
    }, [token, user?._id, settings?.pusher_app_key]);

    useEffect(() => {
        if (token) {
            fetchConversations();
            if (user.role === 'instructor' || user.role === 'admin') fetchInstructorCourses();
        }
    }, [token]);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages();
            markMessagesAsRead(selectedContact.contact._id);
        }
    }, [selectedContact]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchGlobalUsers();
            } else {
                setGlobalUsers([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            const convList = data.data || data.result || [];
            if (data.success && Array.isArray(convList)) {
                // Adapt new schema to UI
                const adapted = convList.map(conv => {
                    if (!conv || !conv.participants) return null;
                    const partner = conv.participants.find(p => p && p._id !== user?._id);
                    if (!partner) return null;
                    return {
                        contact: partner,
                        lastMessage: conv.lastMessage,
                        isOnline: (new Date() - new Date(partner.lastActive || 0)) < 5 * 60 * 1000
                    };
                }).filter(Boolean);
                setConversations(adapted);
            }
        } catch (error) {
            console.error('Conversation synchronization failure', error);
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/messages/history/${selectedContact.contact._id}`);
            const messageList = (data.data || data.result || []).filter(Boolean);
            if (data.success) setMessages(messageList);
        } catch (error) {
            console.error('Message history retrieval failure', error);
        }
        setLoading(false);
    };

    const markMessagesAsRead = async (otherUserId) => {
        try {
            await api.patch(`/messages/read/${otherUserId}`);
        } catch (error) {
            console.error("Failed to mark messages as read", error);
        }
    };

    const fetchInstructorCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            if (data.success) setInstructorCourses(data.courses);
        } catch (error) {
            console.error(error);
        }
    };

    const searchGlobalUsers = async () => {
        setIsSearching(true);
        try {
            const { data } = await api.get(`/messages/search-users?q=${searchTerm}`);
            const userList = data.data || data.result || [];
            if (data.success && Array.isArray(userList)) {
                const existingIds = (conversations || []).map(c => c.contact?._id).filter(Boolean);
                const newUsers = userList.filter(u => u && u._id && !existingIds.includes(u._id));
                setGlobalUsers(newUsers);
            }
        } catch (error) {
            console.error('Contact synchronization failure', error);
            toast.error("Contact synchronization failure");
        }
        setIsSearching(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !isBroadcasting) || (isBroadcasting && !selectedCourse)) return;

        try {
            const payload = {
                message: newMessage,
                targetType: isBroadcasting ? 'course' : 'private',
                targetId: isBroadcasting ? selectedCourse : null,
                receiverId: isBroadcasting ? null : selectedContact?.contact?._id
            };

            const { data } = await api.post('/messages/send', payload);

            if (data.success) {
                // Interceptor flattens single objects, so the message might be in data itself or data.data
                const sentMessage = data._id ? data : data.data;
                
                if (sentMessage) {
                    setMessages(prev => {
                        if (prev.find(m => m && m._id === sentMessage._id)) return prev;
                        return [...prev, sentMessage];
                    });
                }
                setNewMessage('');
                if (isBroadcasting) {
                    toast.success('Broadcast Dispatched');
                    setIsBroadcasting(false);
                }
                fetchConversations();
            }
        } catch (error) {
            toast.error('Message Delivery Failed');
        }
    };

    const getDisplayName = (contact) => {
        if (!contact) return 'Unknown';
        if (contact.role === 'admin') return 'System Administrator';
        return contact.name;
    };

    return (
        <div className="flex h-[750px] bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Sidebar: Conversation List */}
            <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-50 flex flex-col bg-gray-50/20 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Neural Relay</h2>
                        {user.role !== 'student' && (
                            <button 
                                onClick={() => { setIsBroadcasting(true); setSelectedContact(null); }}
                                className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                            >
                                <Megaphone size={16} />
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white pl-12 pr-6 py-4 rounded-2xl border border-gray-50 outline-none text-xs font-bold text-gray-900 focus:ring-4 ring-emerald-500/5 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
                    {/* Active Conversations */}
                    {conversations.map((conv) => (
                        <button 
                            key={conv.contact._id}
                            onClick={() => { setSelectedContact(conv); setIsBroadcasting(false); }}
                            className={`w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all ${
                                selectedContact?.contact?._id === conv.contact._id 
                                ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                                : 'bg-white hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                                    {conv.contact.avatar ? (
                                        <img src={conv.contact.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-500">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                {conv.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-black text-sm tracking-tight truncate pr-2">{getDisplayName(conv.contact)}</span>
                                    <span className={`text-[8px] font-bold ${selectedContact?.contact?._id === conv.contact._id ? 'text-white/40' : 'text-gray-400'}`}>
                                        {conv.lastMessage ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false }) : ''}
                                    </span>
                                </div>
                                <p className={`text-[10px] font-medium truncate ${selectedContact?.contact?._id === conv.contact._id ? 'text-white/60' : 'text-gray-400'}`}>
                                    {conv.lastMessage?.sender === user._id ? 'You: ' : ''}{conv.lastMessage?.content || 'Started a conversation'}
                                </p>
                            </div>
                            {!conv.lastMessage?.read && conv.lastMessage?.receiver === user._id && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                        </button>
                    ))}

                    {/* Global Search Results */}
                    {globalUsers.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 px-4">New Connections</p>
                            {globalUsers.map((u) => (
                                <button 
                                    key={u._id}
                                    onClick={() => { 
                                        setSelectedContact({ contact: u, lastMessage: null, isOnline: false }); 
                                        setIsBroadcasting(false);
                                        setMessages([]);
                                        setSearchTerm('');
                                    }}
                                    className="w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all bg-emerald-50/50 hover:bg-emerald-100/50 mb-2"
                                >
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-sm">
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-emerald-500">
                                                <UserIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-black text-sm tracking-tight text-gray-900 block">{u.name}</span>
                                        <span className="text-[8px] font-black uppercase text-emerald-600 opacity-60">{u.role}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {conversations.length === 0 && !isSearching && globalUsers.length === 0 && (
                        <div className="text-center py-20 opacity-20">
                            <Users size={48} className="mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Signals</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedContact && !isBroadcasting ? 'hidden md:flex' : 'flex'}`}>
                {isBroadcasting ? (
                    <div className="flex-1 flex flex-col p-12 overflow-y-auto">
                         <div className="mb-12">
                            <div className="flex items-center gap-3 mb-3">
                                <Megaphone className="text-emerald-500" size={24} />
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Broadcast Hub</h2>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-md">Distribute high-priority instructional signals to all enrolled scholars.</p>
                        </div>
                        
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 mb-3 block">Target Nexus</label>
                                <select 
                                    className="w-full bg-gray-50 px-8 py-5 rounded-2xl border-none outline-none text-xs font-black text-gray-900 focus:ring-4 ring-emerald-500/5 transition-all"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">Select Destination Course</option>
                                    {instructorCourses.map(course => (
                                        <option key={course._id} value={course._id}>{course.courseTitle}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 mb-3 block">Payload Content</label>
                                <textarea 
                                    rows="8"
                                    placeholder="Enter transmission content..."
                                    className="w-full bg-gray-50 px-8 py-8 rounded-[2.5rem] border-none outline-none text-sm font-bold text-gray-900 focus:ring-4 ring-emerald-500/5 transition-all resize-none"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                onClick={handleSendMessage}
                                disabled={!selectedCourse || !newMessage.trim()}
                                className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                            >
                                Deploy Broadcast
                            </button>
                        </div>
                    </div>
                ) : selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedContact(null)} className="md:hidden w-10 h-10 flex items-center justify-center text-gray-400">
                                    <X size={20} />
                                </button>
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                                    {selectedContact.contact.avatar ? (
                                        <img src={selectedContact.contact.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-500">
                                            <UserIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg tracking-tight text-gray-900 leading-none mb-1">{getDisplayName(selectedContact.contact)}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedContact.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {selectedContact.isOnline ? 'Pulse Active' : 'Signal Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:text-emerald-500 transition-all">
                                    <Shield size={18} />
                                </button>
                                <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:text-emerald-500 transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Message History */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/20">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                                    <Globe size={48} className="animate-spin duration-[10s]" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing History...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center py-4">
                                        <span className="px-4 py-1.5 bg-white border border-gray-100 text-[8px] font-black text-gray-300 uppercase tracking-widest rounded-full shadow-sm">
                                            Neural Link Established • Encrypted Channel
                                        </span>
                                    </div>
                                    
                                    {messages.map((msg, i) => {
                                        const isMe = msg.sender._id === user._id || msg.sender === user._id;
                                        return (
                                            <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                    <div className={`p-4 px-6 rounded-[2rem] shadow-sm ${
                                                        isMe 
                                                        ? 'bg-slate-900 text-white rounded-tr-none' 
                                                        : 'bg-white text-gray-900 rounded-tl-none border border-gray-50'
                                                    }`}>
                                                        <p className="text-xs font-bold leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3">
                                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                        </span>
                                                        {isMe && (
                                                            <CheckCheck size={12} className={msg.read ? "text-emerald-500" : "text-gray-300"} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-8 bg-white border-t border-gray-50">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-2.5 pr-3 rounded-[2.5rem] border border-gray-100 focus-within:ring-4 ring-emerald-500/5 focus-within:bg-white transition-all">
                                <button type="button" className="w-12 h-12 bg-white text-gray-400 rounded-2xl flex items-center justify-center hover:text-emerald-500 transition-all shadow-sm">
                                    <Paperclip size={20} />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder="Type a message..."
                                    className="bg-transparent border-none outline-none flex-1 px-4 text-xs font-bold text-gray-900"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                                <button type="button" className="w-12 h-12 text-gray-400 hover:text-amber-500 transition-all">
                                    <Smile size={20} />
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-30"
                                >
                                    <Send size={20} className="ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-gray-50/10">
                        <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-8 relative">
                            <Globe size={64} className="text-gray-200 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">📡</div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Strategic Relay</h2>
                        <p className="text-gray-400 text-sm font-medium max-w-xs mt-4 leading-relaxed mx-auto">
                            Establish a high-fidelity communication link with institutional nodes to initiate scholarly discourse.
                        </p>
                        <div className="flex gap-4 mt-10">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <Shield size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">TLS 1.3 Active</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default NexusChat;
