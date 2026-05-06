import React, { useState, useEffect } from 'react';
import { Video, ChevronRight, Clock, Calendar, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';

const LiveSessionWidget = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/cohort/student-sessions');
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error('Failed to fetch live broadcasts:', error);
        } finally {
            setLoading(false);
        }
    };

    const liveSessions = sessions.filter(s => {
        const now = new Date();
        const start = new Date(s.startTime);
        const end = new Date(start.getTime() + (s.duration * 60000));
        return now >= start && now <= end;
    });

    const upcomingSessions = sessions.filter(s => {
        const now = new Date();
        const start = new Date(s.startTime);
        return now < start;
    });

    const pastSessions = sessions.filter(s => {
        const now = new Date();
        const start = new Date(s.startTime);
        const end = new Date(start.getTime() + (s.duration * 60000));
        return now > end || s.sessionStatus === 'ended';
    });


    if (loading) return (
        <div className="p-12 bg-white/5 rounded-[4rem] flex flex-col items-center justify-center space-y-4 border border-white/5">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Syncing Broadcasts...</p>
        </div>
    );

    if (sessions.length === 0) return (
        <div className="p-12 bg-white/5 rounded-[4rem] text-center border border-white/5">
            <Video size={32} className="mx-auto text-white/20 mb-4" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">No broadcasts scheduled</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Live Now */}
            {liveSessions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-6">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em]">Live Now</p>
                    </div>
                    {liveSessions.map((session, i) => (
                        <div 
                            key={i} 
                            onClick={() => {
                                if (session.provider === 'livekit' || session.roomName) {
                                    navigate(`/student/live-session/${session._id}`);
                                } else if (session.meetingLink) {
                                    window.open(session.meetingLink, '_blank');
                                }
                            }}
                            className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group/live cursor-pointer hover:bg-white/10 transition-all shadow-xl shadow-black/20"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-rose-500 rounded-2xl shadow-xl flex items-center justify-center text-white">
                                    <Video size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-white uppercase text-sm tracking-tighter truncate">{session.title}</p>
                                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mt-1">Status: Active Broadcast</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover/live:scale-110 transition-transform flex-shrink-0">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upcoming */}
            {upcomingSessions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-6">
                        <Clock size={12} className="text-emerald-400" />
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Coming Up Next</p>
                    </div>
                    {upcomingSessions.slice(0, 2).map((session, i) => (
                        <div 
                            key={i} 
                            onClick={() => navigate(`/student/cohort/${session.cohortId?._id || session.cohortId}`)}
                            className="p-6 bg-white/5 border border-transparent hover:border-white/10 rounded-[2rem] flex items-center justify-between group/upcoming cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                    <Calendar size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-white/80 uppercase text-[11px] tracking-tight truncate">{session.title}</p>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">
                                        {new Date(session.startTime).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-white/20 group-hover/upcoming:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
            )}

            {/* Past Archives */}
            {pastSessions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-6">
                        <Zap size={12} className="text-blue-400" />
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Session Archives</p>
                    </div>
                    {pastSessions.slice(0, 3).map((session, i) => (
                        <div 
                            key={i} 
                            onClick={() => session.recordingUrl && window.open(session.recordingUrl, '_blank')}
                            className={`p-6 bg-white/5 border border-transparent rounded-[2rem] flex items-center justify-between group/past transition-all ${session.recordingUrl ? 'cursor-pointer hover:bg-white/10 hover:border-white/10' : 'opacity-40 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.recordingUrl ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                    <Video size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-white/60 uppercase text-[10px] tracking-tight truncate">{session.title}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">
                                        {session.recordingUrl ? 'Recording Available' : 'No Recording Artifact'}
                                    </p>
                                </div>
                            </div>
                            {session.recordingUrl && (
                                <div className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover/past:opacity-100 transition-opacity">
                                    Watch
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {liveSessions.length === 0 && upcomingSessions.length === 0 && pastSessions.length === 0 && (
                <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Subspace radio silent</p>
            )}
        </div>
    );

};

export default LiveSessionWidget;


