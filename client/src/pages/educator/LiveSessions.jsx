import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { Video, Calendar, Clock, ExternalLink, Activity, Users, Search, Filter, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const LiveSessions = () => {
    const { navigate } = useContext(AppContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('scheduled'); // scheduled | live | ended | cancelled
    const [search, setSearch] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        provider: 'livekit',
        meetingLink: '',
        sessionStatus: '',
        recordingUrl: ''
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/cohort/instructor-sessions');
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to synchronize session registry");
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(s => {
        const matchesFilter = filter === 'all' ? true : s.sessionStatus === filter;
        const searchText = [s.title, s.cohortId?.cohortName, s.cohortId?.courseId?.courseTitle]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        const matchesSearch = !search.trim() || searchText.includes(search.trim().toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleUpdateStatus = async (sessionId, status) => {
        try {
            const { data } = await api.put(`/cohort/update-session/${sessionId}`, { sessionStatus: status });
            if (data.success) {
                toast.success(`Session status updated to ${status}`);
                fetchSessions();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/cohort/update-session/${selectedSession._id}`, editData);
            if (data.success) {
                toast.success("Broadcast configuration updated");
                setShowEditModal(false);
                fetchSessions();
            }
        } catch (error) {
            toast.error("Calibration failed");
        }
    };

    const openEdit = (session) => {
        setSelectedSession(session);
        setEditData({
            title: session.title,
            provider: session.provider || (session.roomName ? 'livekit' : 'external'),
            meetingLink: session.meetingLink,
            sessionStatus: session.sessionStatus,
            recordingUrl: session.recordingUrl || ''
        });
        setShowEditModal(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Broadcast Registry...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 instructor-theme pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-10">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Live Deployments</h1>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] opacity-80">Real-time Broadcast Management & Participation Intelligence</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                    {['scheduled', 'live', 'ended', 'cancelled', 'all'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === t ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Broadcast Identity..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-16 pr-8 py-4 text-xs font-bold outline-none transition-all w-[300px]"
                        />
                    </div>
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredSessions.length === 0 ? (
                    <div className="md:col-span-2 xl:col-span-3 py-20 text-center bg-slate-50 rounded-[4rem] border border-dashed border-slate-200">
                        <Video size={48} className="mx-auto text-slate-200 mb-6" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No matching broadcast artifacts found in this sector</p>
                    </div>
                ) : (
                    filteredSessions.map((session, i) => {
                        const isLive = session.sessionStatus === 'live';
                        return (
                            <div key={i} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/40 hover:-translate-y-2 transition-all group overflow-hidden relative">
                                {isLive && (
                                    <div className="absolute top-0 right-0 px-8 py-3 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl animate-pulse">
                                        Active Broadcast
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100">
                                        <Video size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(session)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Activity size={16} /></button>
                                            <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                                                session.sessionStatus === 'live' ? 'bg-rose-500 text-white' : 
                                                session.sessionStatus === 'ended' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {session.sessionStatus}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{session.cohortId?.cohortName}</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-tight line-clamp-2">{session.title}</h3>
                                
                                <div className="space-y-3 mb-10">
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <Calendar size={14} className="opacity-40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(session.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <Clock size={14} className="opacity-40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {session.duration}m</span>
                                    </div>
                                    {session.recordingUrl && (
                                        <div className="flex items-center gap-4 text-emerald-600">
                                            <CheckCircle2 size={14} className="opacity-70" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Recording Linked</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {isLive ? (
                                        <button 
                                            onClick={() => handleUpdateStatus(session._id, 'ended')}
                                            className="flex-1 h-16 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Activity size={14} />
                                            <span>End Broadcast</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                if (session.provider === 'livekit' || session.roomName) {
                                                    navigate(`/educator/live-session/${session._id}`);
                                                    return;
                                                }
                                                if (session.meetingLink) {
                                                    window.open(session.meetingLink, '_blank');
                                                    return;
                                                }
                                                toast.error('No classroom deployment path is configured for this session.');
                                            }}
                                            className="flex-1 h-16 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                                        >
                                            <ExternalLink size={14} />
                                            <span>Deploy Stream</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/educator/attendance/${session._id}`)}
                                        className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-100 transition-all border border-emerald-100"
                                        title="View Participation Intelligence"
                                    >
                                        <Users size={18} />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6">
                    <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 relative animate-in zoom-in duration-300">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-12">Broadcast Calibration</h2>
                        <form onSubmit={handleSaveEdit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Broadcast Identity</label>
                                <input required type="text" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})}/>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Classroom Provider</label>
                                <select className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={editData.provider} onChange={(e) => setEditData({...editData, provider: e.target.value})}>
                                    <option value="livekit">LiveKit Classroom</option>
                                    <option value="external">External Meeting Link</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Deployment Stream Link</label>
                                <input type="url" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={editData.meetingLink} onChange={(e) => setEditData({...editData, meetingLink: e.target.value})} placeholder={editData.provider === 'livekit' ? 'Optional external fallback link' : 'Required external meeting link'} />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Transmission Status</label>
                                    <select className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={editData.sessionStatus} onChange={(e) => setEditData({...editData, sessionStatus: e.target.value})}>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="live">Live Now</option>
                                        <option value="ended">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Catch-up Link (Optional)</label>
                                    <input type="url" placeholder="Recording URL..." className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={editData.recordingUrl} onChange={(e) => setEditData({...editData, recordingUrl: e.target.value})}/>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-20 bg-slate-100 text-slate-400 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-slate-200 transition-all">Abort</button>
                                <button type="submit" className="flex-2 h-20 bg-emerald-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all px-12">Commit Configuration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveSessions;



