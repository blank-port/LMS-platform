import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../components/student/Footer';
import { 
    Award, Star, MessageCircle, Clock, CheckCircle, ShieldCheck,
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Maximize, Minimize, Settings, ChevronDown, ChevronRight,
    BookOpen, FileText, MessageSquare, PenLine, ArrowLeft,
    PictureInPicture2, Bookmark, ChevronLeft
} from 'lucide-react';

const Player = () => {
    const { courseId } = useParams();
    const { backendUrl, token, navigate, settings } = useContext(AppContext);
    const [courseData, setCourseData] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [discussions, setDiscussions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoQuality, setVideoQuality] = useState('auto');
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [intendedSeekTime, setIntendedSeekTime] = useState(null);
    const [collapsedChapters, setCollapsedChapters] = useState({});
    const [lectureNotes, setLectureNotes] = useState('');
    const [buffered, setBuffered] = useState(0);

    const videoRef = React.useRef(null);
    const playerRef = React.useRef(null);
    const controlsTimeoutRef = React.useRef(null);

    // ─── Cloudinary Optimization ─────────────────────────────────────
    const getOptimizedVideoUrl = (url, quality) => {
        if (!url || !url.includes('cloudinary.com/video/upload/')) return url;
        let transformation = 'q_auto,f_auto';
        if (quality === '1080p') transformation = 'w_1920,q_auto,f_auto';
        else if (quality === '720p') transformation = 'w_1280,c_scale,q_auto,f_auto';
        else if (quality === '480p') transformation = 'w_854,c_scale,q_auto,f_auto';
        return url.replace('/upload/', `/upload/${transformation}/`);
    };

    const handleQualityChange = (quality) => {
        if (!videoRef.current) return;
        const currentProgress = videoRef.current.currentTime;
        setVideoQuality(quality);
        setShowQualityMenu(false);
        setIsVideoLoading(true);
        setIntendedSeekTime(currentProgress);
    };

    const getYoutubeUrl = (url) => {
        let base = url.replace('watch?v=', 'embed/').split('&')[0];
        if (settings?.show_seekbar === 'No') {
            base += (base.includes('?') ? '&' : '?') + 'controls=0';
        }
        return base;
    };

    // ─── Data Fetching ───────────────────────────────────────────────
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/full/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setCourseData(data.courseData);
                setEnrollment(data.enrollment);
                if (data.courseData.courseContent?.length > 0 && data.courseData.courseContent[0].chapterContent?.length > 0) {
                    setCurrentLecture(data.courseData.courseContent[0].chapterContent[0]);
                }
            } else {
                toast.error(data.message);
                navigate('/');
            }
        } catch (error) {
            toast.error('Failed to load course');
            navigate('/');
        }
        setLoading(false);
    };

    const fetchDiscussions = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/qa?courseId=${courseId}&lessonId=${currentLecture?._id || ''}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                const sorted = data.discussions.sort((a, b) => (b.isGoldenKnowledge ? 1 : 0) - (a.isGoldenKnowledge ? 1 : 0));
                setDiscussions(sorted);
            }
        } catch (error) { console.error('Discussion fetch failed'); }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/review/course/${courseId}`);
            if (data.success) setReviews(data.reviews);
        } catch (error) { console.error('Reviews fetch failed'); }
    };

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/comm/qa`, {
                courseId,
                lessonId: currentLecture?._id,
                message: newQuestion
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setNewQuestion('');
                fetchDiscussions();
                toast.success('Question posted');
            }
        } catch (error) { toast.error('Failed to post question'); }
    };

    useEffect(() => {
        if (activeTab === 'qa') fetchDiscussions();
        if (activeTab === 'reviews') fetchReviews();
    }, [activeTab, currentLecture]);

    // ─── Notes (localStorage) ────────────────────────────────────────
    useEffect(() => {
        if (!currentLecture) return;
        const key = `prismed_notes_${courseId}_${currentLecture._id}`;
        const saved = localStorage.getItem(key);
        setLectureNotes(saved || '');
    }, [currentLecture, courseId]);

    const handleNoteSave = useCallback((value) => {
        setLectureNotes(value);
        if (!currentLecture) return;
        const key = `prismed_notes_${courseId}_${currentLecture._id}`;
        localStorage.setItem(key, value);
    }, [currentLecture, courseId]);

    // ─── Progress / Completion ───────────────────────────────────────
    const markComplete = async (lectureId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/course/progress/update`, {
                courseId, lessonId: lectureId, markAsComplete: true
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setEnrollment(data.enrollment);
                toast.success('Lecture marked complete');
                return true;
            }
        } catch (error) { console.error('Progress sync failed'); }
        return false;
    };

    const getFlattenedLectures = useCallback(() => {
        if (!courseData || !courseData.courseContent) return [];
        return courseData.courseContent.flatMap(ch => ch.chapterContent);
    }, [courseData]);

    const navigateModule = (direction) => {
        const flat = getFlattenedLectures();
        const index = flat.findIndex(l => l._id === currentLecture?._id);
        if (index === -1) return;
        if (direction === 'next' && index < flat.length - 1) {
            setCurrentLecture(flat[index + 1]);
        } else if (direction === 'prev' && index > 0) {
            setCurrentLecture(flat[index - 1]);
        }
    };

    // ─── Video Controls ──────────────────────────────────────────────
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (time) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const skipTime = (seconds) => {
        if (!videoRef.current) return;
        const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        handleSeek(newTime);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (v) => {
        if (!videoRef.current) return;
        videoRef.current.volume = v;
        setVolume(v);
        setIsMuted(v === 0);
    };

    const toggleFullscreen = () => {
        if (!playerRef.current) return;
        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen().catch(() => toast.error('Fullscreen failed'));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const togglePIP = async () => {
        if (!videoRef.current) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (err) { toast.error('PIP not supported'); }
    };

    const handleSpeedChange = (speed) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = speed;
        setPlaybackRate(speed);
        setShowSpeedMenu(false);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const hrs = Math.floor(time / 3600);
        const mins = Math.floor((time % 3600) / 60);
        const secs = Math.floor(time % 60);
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ─── Auto-hide Controls ──────────────────────────────────────────
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    // ─── Keyboard Shortcuts ──────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) return;
            switch (e.key.toLowerCase()) {
                case ' ': e.preventDefault(); togglePlay(); break;
                case 'f': toggleFullscreen(); break;
                case 'arrowleft': skipTime(-10); break;
                case 'arrowright': skipTime(10); break;
                case 'm': toggleMute(); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, duration]);

    // ─── Progress Saver (every 10s) ──────────────────────────────────
    useEffect(() => {
        if (!isPlaying || !currentLecture) return;
        const saverInstance = setInterval(async () => {
            try {
                await axios.post(`${backendUrl}/api/course/progress/update`, {
                    courseId,
                    lessonId: currentLecture._id,
                    lastWatchedTime: videoRef.current?.currentTime || 0
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (err) { console.error('Progress sync failed'); }
        }, 10000);
        return () => clearInterval(saverInstance);
    }, [isPlaying, currentLecture, courseId]);

    // ─── Buffer tracking ─────────────────────────────────────────────
    const updateBuffered = () => {
        if (!videoRef.current || !videoRef.current.buffered.length) return;
        const buf = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((buf / duration) * 100);
    };

    const isLectureCompleted = (lectureId) => {
        return enrollment?.completedLessons?.includes(lectureId?.toString());
    };

    const toggleChapter = (index) => {
        setCollapsedChapters(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // ─── Computed values ─────────────────────────────────────────────
    const progressPercent = useMemo(() => {
        if (!duration) return 0;
        return (currentTime / duration) * 100;
    }, [currentTime, duration]);

    const totalLectures = useMemo(() => {
        return getFlattenedLectures().length;
    }, [courseData]);

    const completedCount = useMemo(() => {
        return enrollment?.completedLessons?.length || 0;
    }, [enrollment]);

    const isNativeVideo = currentLecture?.lectureUrl && 
        !currentLecture.lectureUrl.includes('youtube') && 
        !currentLecture.lectureUrl.includes('vimeo');

    // ─── Loading State ───────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--text-muted)] text-sm font-medium">Loading your course...</p>
        </div>
    );

    if (!courseData) return null;

    // ─── Circular Progress Ring ──────────────────────────────────────
    const ProgressRing = ({ progress, size = 40 }) => {
        const r = (size - 6) / 2;
        const circumference = 2 * Math.PI * r;
        const offset = circumference - (progress / 100) * circumference;
        return (
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-white/10" />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-indigo-500 transition-all duration-700" />
                <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" className="fill-[var(--text-main)] text-[9px] font-bold" transform={`rotate(90 ${size/2} ${size/2})`}>{progress}%</text>
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] flex flex-col pt-16">
            {/* ─── Clean Header Bar ─────────────────────────────────── */}
            <div className="bg-[var(--surface)] border-b border-[var(--border)] py-3 px-4 md:px-8 flex items-center justify-between sticky top-16 z-50">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate('/my-enrollments')}
                        className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-white/10 transition-all group flex-shrink-0"
                    >
                        <ArrowLeft size={16} className="text-[var(--text-muted)] group-hover:text-indigo-600 transition-colors" />
                    </button>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Now Learning</p>
                        <h1 className="text-sm font-bold text-[var(--text-main)] truncate">{courseData.courseTitle}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <ProgressRing progress={enrollment?.progress || 0} />
                        <div className="text-right">
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">{completedCount}/{totalLectures} lectures</p>
                            <p className="text-xs font-bold text-[var(--text-main)]">{enrollment?.progress || 0}% complete</p>
                        </div>
                    </div>
                    {enrollment?.progress === 100 && (
                        <button
                            onClick={() => navigate(`/quiz/${courseId}`)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <Award size={14} /> Take Exam
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Main Layout ──────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row flex-1">
                {/* ─── Left: Video + Tabs ───────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    {/* ─── Video Player Container ───────────────────── */}
                    <div className="bg-black">
                        <div
                            ref={playerRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => isPlaying && setShowControls(false)}
                            className="relative w-full aspect-video max-h-[75vh] bg-black cursor-pointer"
                            onClick={(e) => {
                                if (e.target === e.currentTarget || e.target.tagName === 'VIDEO') togglePlay();
                            }}
                        >
                            {currentLecture?.lectureUrl ? (
                                <>
                                    {currentLecture.lectureUrl.includes('youtube.com') || currentLecture.lectureUrl.includes('youtu.be') ? (
                                        <iframe className="w-full h-full" src={getYoutubeUrl(currentLecture.lectureUrl)} allowFullScreen title={currentLecture.lectureTitle} />
                                    ) : currentLecture.lectureUrl.includes('vimeo.com') ? (
                                        <iframe className="w-full h-full" src={`https://player.vimeo.com/video/${currentLecture.lectureUrl.split('/').pop()}`} allowFullScreen title={currentLecture.lectureTitle} />
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            key={`${currentLecture.lectureUrl}-${videoQuality}`}
                                            onPlay={() => { setIsPlaying(true); setIsVideoLoading(false); }}
                                            onPlaying={() => setIsVideoLoading(false)}
                                            onWaiting={() => setIsVideoLoading(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onTimeUpdate={() => { setCurrentTime(videoRef.current.currentTime); updateBuffered(); }}
                                            onLoadedMetadata={() => {
                                                setDuration(videoRef.current.duration);
                                                setIsVideoLoading(false);
                                                if (intendedSeekTime !== null) {
                                                    videoRef.current.currentTime = intendedSeekTime;
                                                    videoRef.current.play();
                                                    setIntendedSeekTime(null);
                                                } else if (enrollment && enrollment.lastWatchedLessonId === currentLecture._id && enrollment.lastWatchedTime > 0) {
                                                    videoRef.current.currentTime = enrollment.lastWatchedTime;
                                                    toast.success(`Resuming from ${formatTime(enrollment.lastWatchedTime)}`);
                                                }
                                            }}
                                            onEnded={async () => {
                                                setIsVideoLoading(false);
                                                await markComplete(currentLecture._id);
                                                const flat = getFlattenedLectures();
                                                const index = flat.findIndex(l => l._id === currentLecture._id);
                                                if (index < flat.length - 1) {
                                                    setCurrentLecture(flat[index + 1]);
                                                    toast.info('Playing next lecture...');
                                                } else {
                                                    toast.success('🎉 Course completed! Congratulations!');
                                                }
                                            }}
                                            className="w-full h-full object-contain"
                                            src={getOptimizedVideoUrl(currentLecture.lectureUrl, videoQuality)}
                                            poster={courseData.courseThumbnail}
                                            preload="auto"
                                            playsInline
                                            autoPlay
                                        />
                                    )}

                                    {/* Loading Spinner */}
                                    {isVideoLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
                                            <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}

                                    {/* Center Play Button (paused state) */}
                                    {isNativeVideo && !isPlaying && !isVideoLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 gap-8">
                                            <button onClick={() => skipTime(-10)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-all text-white/70 hover:text-white">
                                                <SkipBack size={18} />
                                            </button>
                                            <button
                                                onClick={togglePlay}
                                                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all shadow-2xl"
                                            >
                                                <Play size={32} className="text-white ml-1" fill="white" />
                                            </button>
                                            <button onClick={() => skipTime(10)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-all text-white/70 hover:text-white">
                                                <SkipForward size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {/* ─── Bottom Controls ─────────────────────── */}
                                    {isNativeVideo && (
                                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 transition-all duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                            {/* Progress Bar */}
                                            <div className="group relative h-1 hover:h-1.5 mb-3 cursor-pointer transition-all rounded-full overflow-hidden"
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const percent = (e.clientX - rect.left) / rect.width;
                                                    handleSeek(percent * duration);
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                                                <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buffered}%` }}></div>
                                                <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-indigo-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white"
                                                    style={{ left: `calc(${progressPercent}% - 7px)` }}
                                                ></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {/* Left Controls */}
                                                <div className="flex items-center gap-2">
                                                    <button onClick={togglePlay} className="w-9 h-9 flex items-center justify-center text-white hover:text-indigo-300 transition-colors">
                                                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                                                    </button>
                                                    <button onClick={() => skipTime(-10)} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Rewind 10s">
                                                        <SkipBack size={16} />
                                                    </button>
                                                    <button onClick={() => skipTime(10)} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Forward 10s">
                                                        <SkipForward size={16} />
                                                    </button>

                                                    {/* Volume */}
                                                    <div className="flex items-center gap-1 group/vol">
                                                        <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                        </button>
                                                        <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300">
                                                            <input
                                                                type="range" min="0" max="1" step="0.01" value={volume}
                                                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                                                className="w-20 h-1 bg-white/20 rounded-full accent-indigo-500 cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>

                                                    <span className="text-white/60 text-xs font-medium ml-2 tabular-nums">
                                                        {formatTime(currentTime)} / {formatTime(duration)}
                                                    </span>
                                                </div>

                                                {/* Right Controls */}
                                                <div className="flex items-center gap-1">
                                                    {/* Speed */}
                                                    <div className="relative">
                                                        <button onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }} className="h-8 px-2 flex items-center justify-center text-white/70 hover:text-white transition-colors text-xs font-semibold">
                                                            {playbackRate}x
                                                        </button>
                                                        {showSpeedMenu && (
                                                            <div className="absolute bottom-full mb-2 right-0 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[100px] z-50">
                                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                                    <button key={rate} onClick={() => handleSpeedChange(rate)}
                                                                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${playbackRate === rate ? 'bg-indigo-600 text-white' : 'text-white/70 hover:bg-white/10'}`}>
                                                                        {rate}x {rate === 1 && '(Normal)'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quality */}
                                                    <div className="relative">
                                                        <button onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                                                            <Settings size={16} />
                                                        </button>
                                                        {showQualityMenu && (
                                                            <div className="absolute bottom-full mb-2 right-0 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[130px] z-50">
                                                                <div className="text-[10px] font-semibold uppercase text-white/40 px-4 py-2 border-b border-white/10">Quality</div>
                                                                {['auto', '1080p', '720p', '480p'].map(q => (
                                                                    <button key={q} onClick={() => handleQualityChange(q)}
                                                                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${videoQuality === q ? 'bg-indigo-600 text-white' : 'text-white/70 hover:bg-white/10'}`}>
                                                                        {q === 'auto' ? 'Auto' : q}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* PIP */}
                                                    <button onClick={togglePIP} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Picture in Picture">
                                                        <PictureInPicture2 size={16} />
                                                    </button>

                                                    {/* Fullscreen */}
                                                    <button onClick={toggleFullscreen} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                                                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-gray-900">
                                    <BookOpen size={48} className="text-white/10 mb-4" />
                                    <h3 className="text-lg font-semibold text-white/60">Select a lecture to begin</h3>
                                    <p className="text-white/30 text-sm mt-2">Choose from the course content on the right</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Content Tabs ──────────────────────────────── */}
                    <div className="bg-[var(--surface)] border-t border-[var(--border)]">
                        {/* Tab Navigation */}
                        <div className="flex items-center gap-1 px-4 md:px-8 pt-4 border-b border-[var(--border)]">
                            {[
                                { key: 'description', label: 'Overview', icon: FileText },
                                ...(settings?.hide_qa !== 'Yes' ? [{ key: 'qa', label: 'Q&A', icon: MessageSquare }] : []),
                                { key: 'reviews', label: 'Reviews', icon: Star },
                                { key: 'notes', label: 'Notes', icon: PenLine },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                                        activeTab === tab.key
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    <tab.icon size={15} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 md:p-8 min-h-[300px]">
                            {/* Description Tab */}
                            {activeTab === 'description' && currentLecture && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-lg">Video Lecture</span>
                                                <span className="text-[var(--text-muted)] text-xs flex items-center gap-1">
                                                    <Clock size={12} /> {currentLecture.lectureDuration} min
                                                </span>
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-2">{currentLecture.lectureTitle}</h2>
                                            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-2xl">
                                                This lecture covers key concepts in {courseData.category?.name || 'this module'}. Take notes and complete the quiz when ready.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => markComplete(currentLecture._id)}
                                            disabled={isLectureCompleted(currentLecture._id)}
                                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                                                isLectureCompleted(currentLecture._id)
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                                            }`}
                                        >
                                            <CheckCircle size={16} />
                                            {isLectureCompleted(currentLecture._id) ? 'Completed' : 'Mark Complete'}
                                        </button>
                                    </div>

                                    {/* Course Info Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[var(--border)]">
                                        {[
                                            { label: 'Duration', value: `${currentLecture.lectureDuration} min`, icon: Clock },
                                            { label: 'Category', value: courseData.category?.name || 'General', icon: BookOpen },
                                            { label: 'Progress', value: `${enrollment?.progress || 0}%`, icon: Award },
                                            { label: 'Lectures', value: `${completedCount}/${totalLectures}`, icon: CheckCircle },
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                                <item.icon size={16} className="text-indigo-500 mb-2" />
                                                <p className="text-xs text-[var(--text-muted)] mb-0.5">{item.label}</p>
                                                <p className="text-sm font-bold text-[var(--text-main)]">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Q&A Tab */}
                            {activeTab === 'qa' && (
                                <div className="animate-in fade-in duration-300 space-y-6">
                                    <form onSubmit={handleSubmitQuestion} className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)]">
                                        <h3 className="text-sm font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                                            <MessageSquare size={16} className="text-indigo-500" /> Ask a Question
                                        </h3>
                                        <textarea
                                            value={newQuestion}
                                            onChange={(e) => setNewQuestion(e.target.value)}
                                            placeholder="What would you like to ask about this lecture?"
                                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 outline-none focus:border-indigo-500/50 resize-none min-h-[100px] transition-all"
                                        />
                                        <div className="mt-4 flex justify-end">
                                            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all">Post Question</button>
                                        </div>
                                    </form>

                                    <div className="space-y-4">
                                        {discussions.length === 0 ? (
                                            <div className="py-16 text-center">
                                                <MessageCircle size={40} className="mx-auto text-[var(--text-muted)]/20 mb-3" />
                                                <p className="text-sm text-[var(--text-muted)]">No questions yet. Be the first to ask!</p>
                                            </div>
                                        ) : discussions.map(q => (
                                            <div key={q._id} className={`p-5 rounded-2xl border transition-all ${
                                                q.isGoldenKnowledge
                                                    ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
                                                    : 'bg-[var(--background)] border-[var(--border)] hover:shadow-md'
                                            }`}>
                                                {q.isGoldenKnowledge && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-semibold mb-3">
                                                        <Award size={10} /> Golden Knowledge
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                                                        q.isGoldenKnowledge ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                                                    }`}>
                                                        {q.userId?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                                                            {q.userId?.name}
                                                            {q.isGoldenKnowledge && <ShieldCheck size={14} className="text-amber-500" />}
                                                        </p>
                                                        <p className="text-[10px] text-[var(--text-muted)]">{new Date(q.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)] leading-relaxed pl-12">{q.message}</p>
                                                {q.isReplied && (
                                                    <div className={`mt-3 ml-12 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                                        q.isGoldenKnowledge ? 'bg-amber-500 text-white' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                                                    }`}>
                                                        <CheckCircle size={12} /> Answered by instructor
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="animate-in fade-in duration-300">
                                    {reviews.length === 0 ? (
                                        <div className="py-16 text-center">
                                            <Star size={40} className="mx-auto text-[var(--text-muted)]/20 mb-3" />
                                            <p className="text-sm text-[var(--text-muted)]">No reviews yet for this course.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map(review => (
                                                <div key={review._id} className="p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <img src={review.userId?.profilePicture || `https://ui-avatars.com/api/?name=${review.userId?.name}&background=random&size=36`} alt="" className="w-9 h-9 rounded-full" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-[var(--text-main)]">{review.userId?.name}</p>
                                                                <p className="text-[10px] text-[var(--text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={14} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.comment && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{review.comment}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                                            <PenLine size={16} className="text-indigo-500" />
                                            Lecture Notes
                                            {currentLecture && <span className="text-xs text-[var(--text-muted)] font-normal">— {currentLecture.lectureTitle}</span>}
                                        </h3>
                                        <span className="text-[10px] text-[var(--text-muted)]">Auto-saved locally</span>
                                    </div>
                                    <textarea
                                        value={lectureNotes}
                                        onChange={(e) => handleNoteSave(e.target.value)}
                                        placeholder="Take notes for this lecture... Your notes are saved automatically and will persist when you return."
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-indigo-500/50 resize-none min-h-[300px] transition-all leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completion CTA */}
                    {enrollment?.progress === 100 && (
                        <div className="m-6 p-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-center text-white shadow-xl">
                            <Award size={40} className="mx-auto mb-4 opacity-80" />
                            <h2 className="text-2xl font-bold mb-2">Course Completed! 🎉</h2>
                            <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">You've finished all lectures. Take the final exam to earn your certificate.</p>
                            <button
                                onClick={() => navigate(`/quiz/${courseId}`)}
                                className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                            >
                                Take Final Exam
                            </button>
                        </div>
                    )}

                    <div className="hidden lg:block">
                        <Footer />
                    </div>
                </div>

                {/* ─── Right: Course Sidebar ─────────────────────────── */}
                <div className="w-full lg:w-[380px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col lg:sticky lg:top-[112px] lg:h-[calc(100vh-112px)] overflow-hidden">
                    {/* Sidebar Header */}
                    <div className="p-5 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-[var(--text-main)]">Course Content</h3>
                            <span className="text-xs text-[var(--text-muted)] font-medium">{completedCount}/{totalLectures} done</span>
                        </div>
                        <div className="w-full bg-[var(--background)] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                                style={{ width: `${enrollment?.progress || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Chapter List */}
                    <div className="flex-1 overflow-y-auto">
                        {courseData.courseContent?.map((chapter, chIndex) => {
                            const isCollapsed = collapsedChapters[chIndex];
                            const chapterLectureCount = chapter.chapterContent?.length || 0;
                            const chapterCompleted = chapter.chapterContent?.filter(l => isLectureCompleted(l._id)).length || 0;

                            return (
                                <div key={chIndex} className="border-b border-[var(--border)]">
                                    {/* Chapter Header */}
                                    <button
                                        onClick={() => toggleChapter(chIndex)}
                                        className="w-full text-left px-5 py-4 flex items-center justify-between bg-[var(--background)]/50 hover:bg-[var(--background)] transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">Section {chIndex + 1}</p>
                                            <p className="text-sm font-semibold text-[var(--text-main)] truncate">{chapter.chapterTitle}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{chapterCompleted}/{chapterLectureCount} lectures</p>
                                        </div>
                                        {isCollapsed ? <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" /> : <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0" />}
                                    </button>

                                    {/* Lecture List */}
                                    {!isCollapsed && (
                                        <div className="divide-y divide-[var(--border)]">
                                            {chapter.chapterContent?.map((lecture, lIndex) => {
                                                const isActive = currentLecture?._id === lecture._id;
                                                const isComplete = isLectureCompleted(lecture._id);

                                                return (
                                                    <button
                                                        key={lIndex}
                                                        onClick={() => setCurrentLecture(lecture)}
                                                        className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition-all relative group ${
                                                            isActive
                                                                ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                                                : 'hover:bg-[var(--background)]'
                                                        }`}
                                                    >
                                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-r"></div>}

                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                                            isComplete
                                                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600'
                                                                : isActive
                                                                    ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600'
                                                                    : 'bg-[var(--background)] text-[var(--text-muted)]'
                                                        }`}>
                                                            {isComplete ? <CheckCircle size={14} /> : (isActive ? <Play size={12} fill="currentColor" /> : lIndex + 1)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs leading-snug truncate ${
                                                                isActive ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-main)] font-medium'
                                                            }`}>
                                                                {lecture.lectureTitle}
                                                            </p>
                                                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                                                                <Clock size={10} /> {lecture.lectureDuration} min
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
