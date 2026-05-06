import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Room, RoomEvent, Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/utils/api';
import { AppContext } from '../../context/AppContextObject.jsx';

const ParticipantTile = ({ participant, isLocal = false }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    const videoPublication = useMemo(() => {
        return (
            participant?.getTrackPublication?.(Track.Source.ScreenShare) ||
            participant?.getTrackPublication?.(Track.Source.Camera) ||
            null
        );
    }, [participant]);

    const audioPublication = useMemo(() => {
        return participant?.getTrackPublication?.(Track.Source.Microphone) || null;
    }, [participant]);

    useEffect(() => {
        const videoTrack = videoPublication?.track;
        if (videoTrack && videoRef.current) {
            videoTrack.attach(videoRef.current);
            return () => videoTrack.detach(videoRef.current);
        }
    }, [videoPublication]);

    useEffect(() => {
        const audioTrack = audioPublication?.track;
        if (audioTrack && audioRef.current && !isLocal) {
            audioTrack.attach(audioRef.current);
            return () => audioTrack.detach(audioRef.current);
        }
    }, [audioPublication, isLocal]);

    const hasVideo = Boolean(videoPublication?.track);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden min-h-[260px] relative">
            <audio ref={audioRef} autoPlay />
            {hasVideo ? (
                <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover min-h-[260px]" />
            ) : (
                <div className="min-h-[260px] flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-black text-white">
                        {(participant?.name || participant?.identity || 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Video Offline</p>
                </div>
            )}
            <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between bg-black/50 backdrop-blur-md rounded-2xl px-4 py-3">
                <div>
                    <p className="text-white text-xs font-black uppercase tracking-widest">
                        {participant?.name || participant?.identity || 'Participant'}
                    </p>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">
                        {isLocal ? 'You' : 'Live Participant'}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                    {audioPublication?.track ? <Mic size={14} /> : <MicOff size={14} />}
                    {videoPublication?.track ? <Video size={14} /> : <VideoOff size={14} />}
                </div>
            </div>
        </div>
    );
};

const LiveClassroom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const [session, setSession] = useState(null);
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [screenEnabled, setScreenEnabled] = useState(false);

    useEffect(() => {
        let activeRoom;

        const syncParticipants = (liveRoom) => {
            setParticipants([liveRoom.localParticipant, ...Array.from(liveRoom.remoteParticipants.values())]);
        };

        const connectToRoom = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/cohort/join/${sessionId}`);
                setSession(data.session);

                if (data.provider !== 'livekit' || !data.token || !data.livekitUrl) {
                    if (data.fallbackLink) {
                        toast.info('Opening fallback live classroom link.');
                        window.open(data.fallbackLink, '_blank');
                    } else {
                        toast.error('No live classroom is available for this session yet.');
                    }
                    navigate(user?.role === 'instructor' || user?.role === 'admin' ? '/educator/live-sessions' : `/student/cohort/${data.session?.cohortId?._id || ''}`);
                    return;
                }

                const liveRoom = new Room();
                activeRoom = liveRoom;

                liveRoom
                    .on(RoomEvent.ParticipantConnected, () => syncParticipants(liveRoom))
                    .on(RoomEvent.ParticipantDisconnected, () => syncParticipants(liveRoom))
                    .on(RoomEvent.TrackSubscribed, () => syncParticipants(liveRoom))
                    .on(RoomEvent.TrackUnsubscribed, () => syncParticipants(liveRoom))
                    .on(RoomEvent.LocalTrackPublished, () => syncParticipants(liveRoom))
                    .on(RoomEvent.LocalTrackUnpublished, () => syncParticipants(liveRoom));

                setJoining(true);
                await liveRoom.connect(data.livekitUrl, data.token, { autoSubscribe: true });
                setRoom(liveRoom);
                syncParticipants(liveRoom);

                if (user?.role === 'student') {
                    try {
                        await api.post(`/cohort/mark-attendance/${sessionId}`);
                    } catch (error) {
                        console.warn('Attendance mark failed:', error?.response?.data?.message || error.message);
                    }
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to join live classroom.');
                navigate(user?.role === 'instructor' || user?.role === 'admin' ? '/educator/live-sessions' : '/student');
            } finally {
                setJoining(false);
                setLoading(false);
            }
        };

        connectToRoom();

        return () => {
            if (activeRoom) {
                activeRoom.disconnect();
            }
        };
    }, [navigate, sessionId, user?.role]);

    const toggleMic = async () => {
        if (!room) return;
        await room.localParticipant.setMicrophoneEnabled(!micEnabled);
        setMicEnabled((prev) => !prev);
    };

    const toggleCamera = async () => {
        if (!room) return;
        await room.localParticipant.setCameraEnabled(!cameraEnabled);
        setCameraEnabled((prev) => !prev);
    };

    const toggleScreenShare = async () => {
        if (!room) return;
        try {
            await room.localParticipant.setScreenShareEnabled(!screenEnabled);
            setScreenEnabled((prev) => !prev);
        } catch (error) {
            toast.error('Screen sharing is unavailable right now.');
        }
    };

    const leaveRoom = () => {
        if (room) {
            room.disconnect();
        }
        navigate(user?.role === 'instructor' || user?.role === 'admin' ? '/educator/live-sessions' : `/student/cohort/${session?.cohortId?._id || ''}`);
    };

    if (loading || joining) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-white">
                <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
                    {joining ? 'Joining Live Classroom' : 'Synchronizing Live Session'}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                    <button
                        onClick={leaveRoom}
                        className="inline-flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft size={14} />
                        <span>Return</span>
                    </button>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase">{session?.title || 'Live Classroom'}</h1>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.35em]">
                        Built-in LiveKit Classroom
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[2rem] px-6 py-4 flex items-center gap-4">
                    <Users className="text-emerald-400" size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">
                        {participants.length} participant{participants.length === 1 ? '' : 's'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {participants.map((participant) => (
                        <ParticipantTile
                            key={participant.sid || participant.identity}
                            participant={participant}
                            isLocal={participant.identity === room?.localParticipant?.identity}
                        />
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6 h-fit">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">Controls</p>
                        <p className="text-sm text-white/70 mt-2">
                            Toggle your mic, camera, and screen sharing while staying inside PrismEd.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={toggleMic} className={`h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${micEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                            {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                            <span>{micEnabled ? 'Mute' : 'Mic'}</span>
                        </button>
                        <button onClick={toggleCamera} className={`h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${cameraEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                            {cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                            <span>{cameraEnabled ? 'Stop Cam' : 'Camera'}</span>
                        </button>
                    </div>

                    {(user?.role === 'instructor' || user?.role === 'admin') && (
                        <button onClick={toggleScreenShare} className={`w-full h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${screenEnabled ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white'}`}>
                            <MonitorUp size={16} />
                            <span>{screenEnabled ? 'Stop Share' : 'Share Screen'}</span>
                        </button>
                    )}

                    {session?.meetingLink && (
                        <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full text-center h-16 leading-[4rem] rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/5"
                        >
                            Open External Fallback
                        </a>
                    )}

                    <button onClick={leaveRoom} className="w-full h-16 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <PhoneOff size={16} />
                        <span>Leave Classroom</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveClassroom;


