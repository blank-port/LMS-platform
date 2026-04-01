import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageSquare, HelpCircle, Mail, Settings, Activity, Send, ShieldAlert, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageCommunication = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [stats, setStats] = useState({
        pendingComments: 0,
        unrepliedQuestions: 0,
        unreadMessages: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchOverview = async () => {
        try {
            // Simplified for now, gathering counts from the modular APIs
            const [commRes, qaRes, msgRes] = await Promise.all([
                axios.get(`${backendUrl}/api/comm/comments?status=pending`, getHeaders()),
                axios.get(`${backendUrl}/api/comm/qa`, getHeaders()),
                axios.get(`${backendUrl}/api/comm/messages`, getHeaders())
            ]);

            setStats({
                pendingComments: commRes.data.comments?.length || 0,
                unrepliedQuestions: qaRes.data.discussions?.filter(d => !d.isReplied).length || 0,
                unreadMessages: msgRes.data.messages?.length || 0 // unread filtering can be added later
            });
        } catch (error) {
            console.error('Nexus Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const nexusCards = [
        { 
            title: 'Digital Discourse', 
            label: 'Comment Moderation', 
            count: stats.pendingComments, 
            path: '/admin/comments', 
            icon: <MessageSquare size={24} />, 
            color: 'indigo',
            desc: 'Monitor and moderate scholarly interactions across blogs and topics.'
        },
        { 
            title: 'Instructional Pulse', 
            label: 'Q&A Discussions', 
            count: stats.unrepliedQuestions, 
            path: '/admin/qa', 
            icon: <HelpCircle size={24} />, 
            color: 'purple',
            desc: 'Ensure resolution for student inquiries and academic discourse.'
        },
        { 
            title: 'Encrypted Relay', 
            label: 'Private Messages', 
            count: stats.unreadMessages, 
            path: '/admin/messages', 
            icon: <Mail size={24} />, 
            color: 'rose',
            desc: 'Secure direct communication terminal for individualized student support.'
        }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Strategic Nexus...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-gray-100 pb-10">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Strategic Nexus</h1>
                    <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-[0.3em]">Communication Oversight & Institutional Relations Terminal</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3 shadow-xl shadow-gray-200/50">
                        <Activity size={16} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hub Integrity: 100%</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {nexusCards.map((card, i) => (
                    <Link key={i} to={card.path} className="group bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-2xl shadow-gray-200/30 hover:shadow-indigo-100 transition-all hover:-translate-y-2 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all text-7xl text-${card.color}-600`}>{card.icon}</div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className={`w-16 h-16 rounded-[1.5rem] bg-${card.color}-50 flex items-center justify-center text-${card.color}-500 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                                {card.icon}
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">{card.title}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{card.label}</p>
                            </div>

                            <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-[200px] h-12 line-clamp-2">{card.desc}</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                <span className="text-2xl font-black text-gray-900 tracking-tighter">{card.count}</span>
                                <span className={`text-[9px] font-black text-${card.color}-500 uppercase tracking-widest bg-${card.color}-50/50 px-3 py-1 rounded-full`}>Pending Sync</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Critical Operations Panel */}
            <div className="bg-gradient-to-br from-[#0C132B] to-[#16213e] rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row gap-16">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-4">
                            <ShieldAlert className="text-rose-400" />
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] italic">High-Priority Directives</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight italic">Global Moderation & Institutional Protocols</h2>
                        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xl">
                            Strategic oversight of scholar interactions ensures knowledge asset integrity. Automate resolution protocols and synchronize encryption relays through the administrative control surface.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/admin/comm-settings" className="h-16 px-12 bg-white text-gray-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-black/20">
                                <Settings size={14} /> Nexus Protocols
                            </Link>
                            <button onClick={fetchOverview} className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                                Perform Global Audit
                            </button>
                        </div>
                    </div>

                    <div className="lg:w-96 flex flex-col justify-center gap-8">
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <BarChart className="text-indigo-400" size={20} />
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 italic">Response Velocity</span>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-white/40">
                                        <span>Q&A Resolution</span>
                                        <span>88%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[88%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-white/40">
                                        <span>Moderation Latency</span>
                                        <span>4ms</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[95%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCommunication;
