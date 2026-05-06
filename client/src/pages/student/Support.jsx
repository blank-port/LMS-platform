import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { MessageSquare, Plus, Send, Clock, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';

const Support = () => {
    const { backendUrl, token, user } = useContext(AppContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newTicket, setNewTicket] = useState({ subject: '', category: 'technical', priority: 'medium', description: '' });
    const [reply, setReply] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            fetchTickets();
        }
    }, [token]);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/support/my-tickets');
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (error) {
            toast.error('Failed to load tickets');
        }
        setLoading(false);
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/support/create', newTicket);
            if (data.success) {
                toast.success('Ticket raised successfully');
                setShowCreateModal(false);
                setNewTicket({ subject: '', category: 'technical', priority: 'medium', description: '' });
                fetchTickets();
            }
        } catch (error) {
            toast.error('Failed to raise ticket');
        }
        setSubmitting(false);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await api.post(`/support/reply/${selectedTicket._id}`, { message: reply });
            if (data.success) {
                setReply('');
                const updatedTicket = { ...selectedTicket, messages: [...selectedTicket.messages, { sender: user._id, message: reply, createdAt: new Date() }] };
                setSelectedTicket(updatedTicket);
                fetchTickets();
            }
        } catch (error) {
            toast.error('Failed to send reply');
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-20 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Establishing Secure Communication Channel...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Signal Dispatch</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct communication with administration and faculty</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                >
                    <Plus size={16} /> New Transmission
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Tickets List */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Active Logs</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {tickets.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-10 text-center border border-dashed border-gray-100 text-gray-300 text-sm italic">
                                No incident logs found.
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <button 
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`w-full p-8 rounded-[2.5rem] border text-left transition-all ${
                                        selectedTicket?._id === ticket._id 
                                        ? 'bg-[#0C132B] text-white border-transparent shadow-2xl scale-[1.02]' 
                                        : 'bg-white text-gray-900 border-gray-50 hover:border-indigo-100 shadow-xl shadow-gray-200/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 
                                            ticket.status === 'in-progress' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                            {ticket.status}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${selectedTicket?._id === ticket._id ? 'text-white/40' : 'text-gray-300'}`}>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-black text-sm tracking-tight line-clamp-1">{ticket.subject}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${selectedTicket?._id === ticket._id ? 'text-indigo-400' : 'text-indigo-500'}`}>
                                        {ticket.category} • {ticket.priority}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Conversation View */}
                <div className="lg:col-span-2">
                    {selectedTicket ? (
                        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden flex flex-col h-[700px]">
                            {/* Header */}
                            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tighter">{selectedTicket.subject}</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ticket ID: #{selectedTicket._id.slice(-8)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol Status</p>
                                        <p className="text-xs font-black text-indigo-500 uppercase">{selectedTicket.status}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                        <MessageSquare size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="flex flex-col gap-2">
                                    <div className="max-w-[80%] bg-indigo-50/50 p-6 rounded-[2rem] rounded-tl-none border border-indigo-50">
                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">{selectedTicket.description}</p>
                                    </div>
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest px-2">System Initial Transmission</span>
                                </div>

                                {selectedTicket.messages.map((msg, i) => {
                                    const isMe = msg.sender === user._id;
                                    return (
                                        <div key={i} className={`flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[80%] p-6 rounded-[2rem] border ${
                                                isMe ? 'bg-[#0C132B] text-white border-transparent rounded-tr-none' : 'bg-gray-100 text-gray-900 border-gray-200 rounded-tl-none'
                                            }`}>
                                                <p className="text-xs font-bold leading-relaxed">{msg.message}</p>
                                            </div>
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest px-2">
                                                {isMe ? 'Verification Node' : 'Administrator response'} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input */}
                            {selectedTicket.status !== 'closed' && (
                                <form onSubmit={handleReply} className="p-8 bg-gray-50/30 border-t border-gray-50">
                                    <div className="flex items-center gap-4 bg-white p-4 pr-6 rounded-[2.5rem] border border-gray-100 focus-within:ring-8 ring-indigo-500/5 transition-all shadow-xl shadow-gray-200/20">
                                        <input 
                                            type="text" 
                                            placeholder="Broadcast a response..." 
                                            className="bg-transparent border-none outline-none flex-1 px-4 text-xs font-bold text-gray-900 placeholder:text-gray-200"
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={submitting || !reply.trim()}
                                            className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:scale-95"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="h-[700px] flex flex-col items-center justify-center bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50 border-dashed p-20 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 grayscale opacity-20">📡</div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Awaiting Signal Link</h2>
                            <p className="text-gray-400 text-xs font-medium max-w-sm">Synchronize with an existing incident log or initiate a new transmission to start communications.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Initiate Transmission</h2>
                            <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 bg-white text-gray-300 rounded-2xl flex items-center justify-center hover:text-rose-500 transition-all shadow-xl shadow-gray-200/20">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Incident Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 outline-none text-xs font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                        placeholder="Brief description of the anomaly"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Categorization</label>
                                    <select 
                                        className="w-full bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 outline-none text-xs font-black text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all"
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                                    >
                                        <option value="technical">Technical Infrastructure</option>
                                        <option value="billing">Fiscal / Billing</option>
                                        <option value="content">Course Materials</option>
                                        <option value="other">General Inquiries</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Intensity Level</label>
                                <div className="flex gap-4">
                                    {['low', 'medium', 'high', 'critical'].map((p) => (
                                        <button 
                                            key={p}
                                            type="button"
                                            onClick={() => setNewTicket({...newTicket, priority: p})}
                                            className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                                                newTicket.priority === p 
                                                ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/20' 
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-100'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Detailed Situation Brief</label>
                                <textarea 
                                    rows="5"
                                    required
                                    className="w-full bg-gray-50 px-8 py-6 rounded-[2.5rem] border border-gray-100 outline-none text-xs font-bold text-gray-900 focus:ring-4 ring-indigo-500/5 transition-all resize-none"
                                    placeholder="Provide comprehensive details for debugging..."
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full py-6 bg-[#0C132B] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/10 disabled:opacity-50"
                            >
                                {submitting ? 'Transmitting Data...' : 'Broadcast Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;




