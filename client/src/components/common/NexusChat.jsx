import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Send, Search, User as UserIcon, Shield, 
    MoreVertical, Paperclip, Smile, Check, 
    CheckCheck, Globe, Users, Megaphone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NexusChat = ({ panel = 'student' }) => {
    const { backendUrl, token, user, settings } = useContext(AppContext);
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null); // { contact, lastMessage, isOnline }
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [instructorCourses, setInstructorCourses] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (token) {
            fetchConversations();
            if (user.role === 'instructor') fetchInstructorCourses();
        }
    }, [token]);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages();
        }
    }, [selectedContact]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setConversations(data.conversations);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/messages?partnerId=${selectedContact.contact._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setMessages(data.messages);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchInstructorCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setInstructorCourses(data.courses);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !isBroadcasting) || (isBroadcasting && !selectedCourse)) return;

        try {
            const payload = {
                content: newMessage,
                targetType: isBroadcasting ? 'course' : 'private',
                targetId: isBroadcasting ? selectedCourse : null,
                receiverId: isBroadcasting ? null : selectedContact.contact._id
            };

            const { data } = await axios.post(`${backendUrl}/api/comm/messages`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setMessages([...messages, data.data]);
                setNewMessage('');
                if (isBroadcasting) {
                    toast.success('Broadcast Dispatched to Global Scholars');
                    setIsBroadcasting(false);
                }
                fetchConversations();
            }
        } catch (error) {
            toast.error('Protocol Sync Failed');
        }
    };

    const filteredConversations = conversations.filter(conv => 
        conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDisplayName = (contact) => {
        if (contact.role === 'admin') return settings?.site_title || 'Institutional Support';
        return contact.name;
    };

    return (
        <div className="flex h-[80vh] bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            {/* Sidebar: Message Hub */}
            <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-50 flex flex-col bg-gray-50/20 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter">Exchange</h2>
                        <div className="flex gap-2">
                            {user.role === 'instructor' && (
                                <button 
                                    onClick={() => { setIsBroadcasting(true); setSelectedContact(null); }}
                                    className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-100"
                                >
                                    <Megaphone size={16} />
                                </button>
                            )}
                            <button className="w-10 h-10 bg-white text-gray-400 rounded-xl flex items-center justify-center hover:text-gray-900 transition-all border border-gray-50 shadow-sm">
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Find collaborator..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-50 outline-none text-xs font-bold text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-20 opacity-20 filter grayscale">
                            <Users size={48} className="mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Nodes</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button 
                                key={conv.contact._id}
                                onClick={() => { setSelectedContact(conv); setIsBroadcasting(false); }}
                                className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all ${
                                    selectedContact?.contact?._id === conv.contact._id 
                                    ? 'bg-[#0C132B] text-white shadow-2xl scale-[1.02]' 
                                    : 'bg-white hover:bg-gray-50 shadow-sm shadow-gray-100 border border-transparent hover:border-indigo-100'
                                }`}
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                                        {conv.contact.avatar ? (
                                            <img src={conv.contact.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                                                <UserIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    {conv.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-black text-sm tracking-tight">{getDisplayName(conv.contact)}</span>
                                        <span className={`text-[8px] font-black uppercase ${selectedContact?.contact?._id === conv.contact._id ? 'text-white/40' : 'text-gray-300'}`}>
                                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                                        </span>
                                    </div>
                                    <p className={`text-[10px] font-medium line-clamp-1 ${selectedContact?.contact?._id === conv.contact._id ? 'text-white/60' : 'text-gray-400'}`}>
                                        {conv.lastMessage.sender === user._id ? 'You: ' : ''}{conv.lastMessage.content}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area: Sync Main Deck */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedContact && !isBroadcasting ? 'hidden md:flex' : 'flex'}`}>
                {isBroadcasting ? (
                    <div className="flex-1 flex flex-col p-12">
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Broadcast Protocol</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Transmit a high-priority signal to all enrolled scholars of a curriculum node.</p>
                        </div>
                        
                        <div className="space-y-8 flex-1 max-w-2xl">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block text-indigo-500">Target Curriculum</label>
                                <select 
                                    className="w-full bg-gray-50 px-8 py-5 rounded-2xl border-none outline-none text-xs font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">Select Nexus Destination</option>
                                    {instructorCourses.map(course => (
                                        <option key={course._id} value={course._id}>{course.courseTitle}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block text-indigo-500">Transmission Payload</label>
                                <textarea 
                                    rows="10"
                                    placeholder="Draft institutional broadcast..."
                                    className="w-full bg-gray-50 px-8 py-8 rounded-[2.5rem] border-none outline-none text-sm font-bold text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all resize-none shadow-inner"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                onClick={handleSendMessage}
                                disabled={!selectedCourse || !newMessage.trim()}
                                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-4"
                            >
                                <Megaphone size={20} /> Deploy Broadcast Module
                            </button>
                        </div>
                    </div>
                ) : selectedContact ? (
                    <>
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedContact(null)} className="md:hidden w-10 h-10 flex items-center justify-center text-gray-400">
                                    <Search size={20} className="rotate-90" />
                                </button>
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                                    {selectedContact.contact.avatar ? (
                                        <img src={selectedContact.contact.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg tracking-tight text-gray-900">{getDisplayName(selectedContact.contact)}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedContact.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {selectedContact.isOnline ? 'Active Pulse' : `Last active ${formatDistanceToNow(new Date(selectedContact.contact.lastActive))} ago`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:text-indigo-500 transition-all">
                                    <Shield size={20} />
                                </button>
                                <button className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:text-indigo-500 transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Flow */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-gray-50/30">
                            {loading ? (
                                <div className="h-full flex items-center justify-center space-y-4 flex-col text-center opacity-10 filter grayscale">
                                    <Globe size={48} className="animate-spin duration-[10s]" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Protocol History...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <span className="inline-block px-4 py-2 bg-white text-[8px] font-black text-gray-300 uppercase tracking-widest rounded-full border border-gray-100 shadow-sm">
                                            Nexus Encrypted Session Established
                                        </span>
                                    </div>
                                    
                                    {messages.map((msg, i) => {
                                        const isMe = msg.sender === user._id;
                                        return (
                                            <div key={msg._id} className={`flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[70%] p-6 rounded-[2.5rem] shadow-xl border ${
                                                    isMe 
                                                    ? 'bg-[#0C132B] text-white border-transparent rounded-tr-none shadow-[#0C132B]/10' 
                                                    : 'bg-white text-gray-900 border-gray-50 rounded-tl-none shadow-gray-200/20'
                                                }`}>
                                                    <p className="text-xs font-bold leading-relaxed">{msg.content}</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-2">
                                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {isMe && (
                                                        <CheckCheck size={12} className={msg.isRead ? "text-indigo-500" : "text-gray-200"} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Deck */}
                        <div className="p-8 bg-white border-t border-gray-50 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-3 pr-4 rounded-[2.5rem] border border-gray-100 focus-within:ring-8 ring-indigo-500/5 focus-within:bg-white transition-all shadow-lg active:scale-[0.99]">
                                <button type="button" className="w-12 h-12 bg-white text-gray-400 rounded-[1.5rem] flex items-center justify-center hover:text-indigo-500 transition-all shadow-sm">
                                    <Paperclip size={20} />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder="Transmitting signal..."
                                    className="bg-transparent border-none outline-none flex-1 px-4 text-xs font-bold text-[#0C132B] placeholder:text-gray-300"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="button" className="w-12 h-12 text-gray-400 hover:text-amber-500 transition-all">
                                    <Smile size={20} />
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:scale-95 disabled:shadow-none"
                                >
                                    <Send size={22} className="ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8">
                        <div className="relative">
                            <div className="w-40 h-40 bg-gray-50 rounded-[4rem] flex items-center justify-center animate-pulse">
                                <Globe size={80} className="text-gray-100" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl grayscale opacity-30 shadow-none">📡</div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Awaiting Signal Link</h2>
                            <p className="text-gray-400 text-sm font-medium max-w-sm mt-3 leading-relaxed mx-auto">Selected a node from the exchange to establish a high-fidelity encrypted discourse session.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-300 uppercase tracking-widest rounded-xl">TLS 1.3 Active</span>
                            <span className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-300 uppercase tracking-widest rounded-xl">Pulse Monitoring</span>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #e2e8f0;
                }
            `}</style>
        </div>
    );
};

export default NexusChat;
