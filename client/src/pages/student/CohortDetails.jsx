import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { Users, Calendar, Video, Clock, CheckCircle, ChevronRight, Play } from 'lucide-react';
import { toast } from 'react-toastify';

const NoticeBoard = lazy(() => import('../../components/common/NoticeBoard.jsx'));
const DiscussionSystem = lazy(() => import('../../components/common/DiscussionSystem.jsx'));

const CohortDetails = () => {
    const { cohortId } = useParams();
    const { navigate, user } = useContext(AppContext);
    const [sessions, setSessions] = useState([]);
    const [cohort, setCohort] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [cohortId]);

    const fetchData = async () => {
        try {
            const [sessionsRes, cohortRes] = await Promise.all([
                api.get(`/cohort/sessions/${cohortId}`),
                api.get(`/cohort/${cohortId}`)
            ]);
            
            if (sessionsRes.data.success) {
                setSessions(sessionsRes.data.sessions);
            }
            if (cohortRes.data.success) {
                setCohort(cohortRes.data.cohort);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCalendar = (session) => {
        const start = new Date(session.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(new Date(session.startTime).getTime() + (session.duration || 60) * 60000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const title = `PrismEd Live: ${session.title}`;
        const details = `Join your PrismEd Batch session. Subject: ${session.title}`;
        
        // Choice: Google Calendar or ICS
        if (window.confirm("Add to Google Calendar? (Cancel for ICS download)")) {
            const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&sf=true&output=xml`;
            window.open(gCalUrl, '_blank');
        } else {
            const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${title}\nDESCRIPTION:${details}\nEND:VEVENT\nEND:VCALENDAR`;
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'session.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        toast.info("Calendar synchronization initiated.");
    };

    const handleJoinSession = async (session) => {
        if (session.sessionStatus === 'ended' && session.recordingUrl) {
            window.open(session.recordingUrl, '_blank');
            return;
        }

        if (session.sessionStatus !== 'live') {
            toast.warning("Session has not started yet. Please check back at the scheduled time.");
            return;
        }

        if (session.provider === 'livekit' || session.roomName) {
            navigate(`/student/live-session/${session._id}`);
            return;
        }

        if (!session.meetingLink) {
            toast.error("Error: Meeting link missing.");
            return;
        }

        try {
            await api.post(`/cohort/mark-attendance/${session._id}`);
            toast.success("Attendance marked. Redirecting to live session.");
            window.open(session.meetingLink, '_blank');
        } catch (error) {
            console.error(error);
            window.open(session.meetingLink, '_blank');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-t-purple-600 border-white/10 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Synchronizing Intelligence...</p>
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 animate-fade-in pb-20 pt-10 px-6 lg:px-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-10">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">Batch Schedule</h1>
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] opacity-80">Live Sessions & Attendance Management</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <Users className="text-purple-400" size={20} />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Active Batch Information</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {sessions.length === 0 ? (
                    <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <Video size={40} className="mx-auto text-white/10 mb-4" />
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No synchronized sessions currently listed in the matrix</p>
                    </div>
                ) : (
                    sessions.map((session, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-purple-500/30 transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-all ${
                                    session.sessionStatus === 'live' ? 'bg-rose-500 animate-pulse' : 'bg-white/10'
                                }`}>
                                    {session.sessionStatus === 'live' ? 'LIVE' : 'NEXT'}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-purple-400 transition-colors">{session.title}</h3>
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                            session.sessionStatus === 'live' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40' : 'bg-white/10 text-gray-400'
                                        }`}>
                                            {session.sessionStatus}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-purple-400/60" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{new Date(session.startTime).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-purple-400/60" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-emerald-500/60" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{session.duration || 60} Minutes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {session.sessionStatus !== 'live' && (
                                    <button
                                        onClick={() => addToCalendar(session)}
                                        className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95 group/cal"
                                        title="Add to Google Calendar"
                                    >
                                        <Calendar size={20} className="group-hover/cal:scale-110 transition-transform" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleJoinSession(session)}
                                    className={`h-16 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-95 ${
                                        session.sessionStatus === 'live' 
                                            ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/40 hover:bg-purple-500' 
                                            : session.sessionStatus === 'ended' && session.recordingUrl
                                            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 hover:bg-emerald-500'
                                            : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-40'
                                    }`}
                                >
                                    <span>
                                        {session.sessionStatus === 'live' ? 'Join Now' : 
                                         (session.sessionStatus === 'ended' && session.recordingUrl) ? 'Watch Recording' : 
                                         'Upcoming Session'}
                                    </span>
                                    {session.sessionStatus === 'ended' && session.recordingUrl ? <Play size={18} /> : <ChevronRight size={18} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Suspense fallback={<div className="h-64 bg-white/5 animate-pulse rounded-[3rem]"></div>}>
                    <NoticeBoard 
                        cohortId={cohortId} 
                        courseId={cohort?.courseId?._id} 
                        mode={user?.role === 'instructor' || user?.role === 'admin' ? 'manage' : 'view'} 
                    />
                </Suspense>

                <Suspense fallback={<div className="h-64 bg-white/5 animate-pulse rounded-[3rem]"></div>}>
                    <DiscussionSystem cohortId={cohortId} courseId={cohort?.courseId?._id} />
                </Suspense>
            </div>
        </div>
    );
};

export default CohortDetails;


