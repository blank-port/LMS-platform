import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../components/student/Footer';
import { assets } from '../../assets/assets';
import { Award, Star, MessageCircle, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

const Player = () => {
    const { courseId } = useParams();
    const { backendUrl, token, navigate, settings } = useContext(AppContext);
    const [courseData, setCourseData] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [discussions, setDiscussions] = useState([]);
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
    
    const videoRef = React.useRef(null);
    const playerRef = React.useRef(null);
    const controlsTimeoutRef = React.useRef(null);

    const getYoutubeUrl = (url) => {
        let base = url.replace('watch?v=', 'embed/').split('&')[0];
        if (settings?.show_seekbar === 'No') {
            base += (base.includes('?') ? '&' : '?') + 'controls=0';
        }
        return base;
    };

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
                // Set first lecture as current
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
                // Sort Golden Knowledge nodes to the top
                const sorted = data.discussions.sort((a, b) => (b.isGoldenKnowledge ? 1 : 0) - (a.isGoldenKnowledge ? 1 : 0));
                setDiscussions(sorted);
            }
        } catch (error) { console.error('Discourse Retrieval Failure'); }
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
                toast.success('Inquiry Dispatched to Nexus');
            }
        } catch (error) { toast.error('Nexus Dispatch Failure'); }
    };

    useEffect(() => {
        if (activeTab === 'qa') fetchDiscussions();
    }, [activeTab, currentLecture]);

    const markComplete = async (lectureId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/course/progress/update`, {
                courseId, lessonId: lectureId, markAsComplete: true
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                setEnrollment(data.enrollment);
                return true;
            }
        } catch (error) {
            console.error('Mastery Sync Failure');
        }
        return false;
    };

    const getFlattenedLectures = () => {
        if (!courseData || !courseData.courseContent) return [];
        return courseData.courseContent.flatMap(ch => ch.chapterContent);
    };

    const navigateModule = (direction) => {
        const flat = getFlattenedLectures();
        const index = flat.findIndex(l => l._id === currentLecture?._id);
        if (index === -1) return;

        if (direction === 'next') {
            if (index < flat.length - 1) {
                setCurrentLecture(flat[index + 1]);
            } else {
                toast.success('🎉 Final Module Reached. Complete it to achieve course mastery!');
            }
        } else if (direction === 'prev') {
            if (index > 0) {
                setCurrentLecture(flat[index - 1]);
            }
        }
    };

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
            playerRef.current.requestFullscreen().catch(err => {
                toast.error('Fullscreen activation failed.');
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleSpeedChange = (speed) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = speed;
        setPlaybackRate(speed);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Auto-hide Controls Logic
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) return;
            
            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'arrowleft':
                    handleSeek(Math.max(0, videoRef.current.currentTime - 10));
                    break;
                case 'arrowright':
                    handleSeek(Math.min(duration, videoRef.current.currentTime + 10));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, duration]);

    // Progress Saving Mechanism
    useEffect(() => {
        if (!isPlaying || !currentLecture) return;

        const saverInstance = setInterval(async () => {
            try {
                await axios.post(`${backendUrl}/api/course/progress/update`, {
                    courseId,
                    lessonId: currentLecture._id,
                    lastWatchedTime: videoRef.current.currentTime
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (err) { console.error('Progress sync failed'); }
        }, 10000);

        return () => clearInterval(saverInstance);
    }, [isPlaying, currentLecture, courseId]);


    const isLectureCompleted = (lectureId) => {
        return enrollment?.completedLessons?.includes(lectureId.toString());
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0C132B] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
            <p className="text-white/40 font-black uppercase text-[10px] tracking-widest animate-pulse">Initializing Learning Sanctuary...</p>
        </div>
    );

    if (!courseData) return null;

    return (
        <div className="min-h-screen bg-[#060B1A] text-white flex flex-col pt-16">
            {/* Cinematic Player Header */}
            <div className="bg-[#0C132B] border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between sticky top-16 z-50 backdrop-blur-3xl">
                <div className="flex items-center gap-6 overflow-hidden">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all group"
                    >
                        <span className="text-white/40 group-hover:text-white group-hover:-translate-x-0.5 transition-all">←</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Now Learning</span>
                        <h1 className="text-sm md:text-base font-black truncate max-w-md tracking-tight">{courseData.courseTitle}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end gap-1.5">
                        <div className="flex items-center justify-between w-40 text-[9px] font-black uppercase tracking-widest text-white/30">
                            <span>Mastery</span>
                            <span className="text-indigo-400">{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="w-40 bg-white/5 rounded-full h-1 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                style={{ width: `${enrollment?.progress || 0}%` }}
                            ></div>
                        </div>
                    </div>
                    {enrollment?.progress === 100 && (
                        <button
                            onClick={() => navigate(`/quiz/${courseId}`)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] animate-bounce"
                        >
                            Final Assessment 🏆
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Main Experience Area */}
                <div className="flex-1 overflow-y-auto bg-black relative">
                    <div 
                        ref={playerRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => isPlaying && setShowControls(false)}
                        className={`relative group bg-black flex items-center justify-center overflow-hidden transition-all duration-500 ${isFullscreen ? 'h-screen w-screen' : 'h-[70vh]'}`}
                    >
                        {currentLecture?.lectureUrl ? (
                            <div className="relative w-full h-full">
                                {currentLecture.lectureUrl.includes('youtube.com') || currentLecture.lectureUrl.includes('youtu.be') ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={getYoutubeUrl(currentLecture.lectureUrl)}
                                        allowFullScreen
                                        title={currentLecture.lectureTitle}
                                    />
                                ) : currentLecture.lectureUrl.includes('vimeo.com') ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://player.vimeo.com/video/${currentLecture.lectureUrl.split('/').pop()}`}
                                        allowFullScreen
                                        title={currentLecture.lectureTitle}
                                    />
                                ) : (
                                    <div className="relative w-full h-full group/player">
                                        <video 
                                            ref={videoRef}
                                            key={currentLecture.lectureUrl}
                                            onPlay={() => {
                                                setIsPlaying(true);
                                                setIsVideoLoading(false);
                                            }}
                                            onPlaying={() => setIsVideoLoading(false)}
                                            onWaiting={() => setIsVideoLoading(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
                                            onLoadedMetadata={() => {
                                                setDuration(videoRef.current.duration);
                                                setIsVideoLoading(false);
                                                // Resume from last watched position
                                                if (enrollment && enrollment.lastWatchedLessonId === currentLecture._id && enrollment.lastWatchedTime > 0) {
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
                                                    toast.info('Moving to Next Module...');
                                                } else {
                                                    toast.success('🎉 Course Fully Mastered! Certification Protocol Initialized.');
                                                    // Optionally trigger course completion modal/confetti here
                                                }
                                            }}
                                            className="w-full h-full object-contain" 
                                            src={currentLecture.lectureUrl} 
                                            poster={courseData.courseThumbnail}
                                            preload="auto"
                                            playsInline
                                            autoPlay
                                        />

                                        {/* Premium Loading Spinner */}
                                        {isVideoLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40 transition-all">
                                                <div className="relative w-24 h-24">
                                                    <div className="absolute inset-0 border-[6px] border-indigo-500/10 rounded-full"></div>
                                                    <div className="absolute inset-0 border-[6px] border-t-indigo-500 rounded-full animate-spin shadow-lg"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Premium Control Overlays (Native Video Only) */}
                                {!(currentLecture.lectureUrl.includes('youtube') || currentLecture.lectureUrl.includes('vimeo')) && (
                                    <>
                                        {/* Large Centered Play/Pause Button */}
                                        {!isPlaying && (
                                            <button 
                                                onClick={togglePlay}
                                                className="absolute inset-0 m-auto w-24 h-24 bg-indigo-600/80 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-all z-20 shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-in zoom-in duration-300"
                                            >
                                                <div className="text-white text-4xl ml-2">▶</div>
                                            </button>
                                        )}

                                        {/* Bottom Control Bar */}
                                        <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-transform duration-500 z-30 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
                                            {/* Progress Slider */}
                                            <div className="group/progress relative h-1.5 mb-6 cursor-pointer flex items-center">
                                                <div className="absolute w-full h-full bg-white/10 rounded-full"></div>
                                                <div 
                                                    className="absolute h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.8)]"
                                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                                ></div>
                                                <input 
                                                    type="range"
                                                    min="0"
                                                    max={duration}
                                                    value={currentTime}
                                                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                                                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div 
                                                    className="absolute w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                                                    style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                                                ></div>
                                            </div>

                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-8">
                                                    <div className="flex items-center gap-6">
                                                        <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
                                                            {isPlaying ? <div className="text-2xl">⏸</div> : <div className="text-2xl">▶</div>}
                                                        </button>
                                                        <button 
                                                            onClick={() => navigateModule('prev')}
                                                            className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5"
                                                        >
                                                            Previous
                                                        </button>
                                                        <button 
                                                            onClick={() => navigateModule('next')}
                                                            className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                    <div className="text-[11px] font-black tracking-widest text-white/50 uppercase">
                                                        <span className="text-white font-black">{formatTime(currentTime)}</span>
                                                        <span className="mx-2">/</span>
                                                        <span>{formatTime(duration)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8">
                                                    {/* Speed Selector */}
                                                    <select 
                                                        value={playbackRate}
                                                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                                                        className="bg-transparent text-[10px] font-black text-white/60 uppercase tracking-widest outline-none cursor-pointer hover:text-white transition-colors"
                                                    >
                                                        {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                                                            <option key={rate} value={rate} className="bg-[#0C132B]">{rate}x</option>
                                                        ))}
                                                    </select>

                                                    {/* Volume Control */}
                                                    <div className="flex items-center gap-3 group/volume">
                                                        <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                                                            {isMuted ? <div className="text-lg">🔇</div> : <div className="text-lg">🔊</div>}
                                                        </button>
                                                        <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 flex items-center">
                                                            <input 
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.01"
                                                                value={volume}
                                                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                                                className="w-20 h-1 bg-white/10 rounded-full accent-indigo-500 cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-colors">
                                                        {isFullscreen ? <div className="text-lg">🗗</div> : <div className="text-lg">🗖</div>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-3xl mb-6">📽️</div>
                                <h3 className="text-xl font-black tracking-tight uppercase">Select Your Learning Path</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-4 max-w-xs">Initialization sequence complete. Standby for curriculum selection.</p>
                            </div>
                        )}
                    </div>

                    {/* Content Intelligence Tabs */}
                    <div className="bg-[#0C132B] border-t border-white/5">
                        <div className="flex px-8 md:px-12 border-b border-white/5">
                            {['description', 'qa', 'reviews'].filter(tab => {
                                if (tab === 'qa' && settings?.hide_qa === 'Yes') return false;
                                return true;
                            }).map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-400' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 md:p-12 min-h-[400px]">
                            {activeTab === 'description' && currentLecture && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">Video Lecture</span>
                                                <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">{currentLecture.lectureDuration} Minutes of Wisdom</span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">{currentLecture.lectureTitle}</h2>
                                            <p className="text-white/40 max-w-2xl text-sm leading-relaxed font-medium">This lecture covers critical concepts in {courseData.category?.name || 'this module'}. Ensure you take notes during the presentation to maximize retention.</p>
                                        </div>
                                        <button
                                            onClick={() => markComplete(currentLecture._id)}
                                            disabled={isLectureCompleted(currentLecture._id)}
                                            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl ${isLectureCompleted(currentLecture._id)
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                                                }`}
                                        >
                                            {isLectureCompleted(currentLecture._id) ? '✓ Mastery Achieved' : 'Finalize Module'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'qa' && (
                                <div className="animate-in slide-in-from-bottom-5 duration-500 space-y-12">
                                    <form onSubmit={handleSubmitQuestion} className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">Initiate Academic Inquiry</h3>
                                        <textarea 
                                            value={newQuestion}
                                            onChange={(e) => setNewQuestion(e.target.value)}
                                            placeholder="Specify your inquiry protocol for this lecture..." 
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-6 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-indigo-500/30 transition-all min-h-[120px] resize-none"
                                        />
                                        <div className="mt-6 flex justify-end">
                                            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Submit Protocol</button>
                                        </div>
                                    </form>

                                    <div className="space-y-6">
                                        {discussions.length === 0 ? (
                                            <div className="py-20 text-center opacity-20">
                                                <div className="text-6xl mb-4 italic italic">e</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Inquiry Void</p>
                                            </div>
                                        ) : discussions.map(q => (
                                            <div key={q._id} className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group/qa ${
                                                q.isGoldenKnowledge 
                                                ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.05)]' 
                                                : 'bg-white/2 border-white/5 hover:bg-white/5'
                                            }`}>
                                                {q.isGoldenKnowledge && (
                                                    <div className="absolute top-0 right-0 px-6 py-2 bg-amber-500 text-white rounded-bl-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                                        <Award size={12} />
                                                        Golden Knowledge
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-all ${
                                                        q.isGoldenKnowledge ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                    }`}>
                                                        {q.userId?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-black text-white/90 tracking-tight">{q.userId?.name}</p>
                                                            {q.isGoldenKnowledge && <ShieldCheck size={14} className="text-amber-500" />}
                                                        </div>
                                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className={`text-base leading-relaxed pl-6 border-l-4 py-1 transition-all ${
                                                    q.isGoldenKnowledge ? 'text-white font-medium border-amber-500 shadow-amber-500/20 text-shadow-sm' : 'text-white/60 border-indigo-500/20 italic'
                                                }`}>
                                                    {q.message}
                                                </p>
                                                {q.isReplied && (
                                                    <div className={`mt-8 py-3 px-6 rounded-xl inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-widest ${
                                                        q.isGoldenKnowledge ? 'bg-amber-500 text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                        <CheckCircle size={14} />
                                                        Institutional Resolution Captured
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="py-20 text-center opacity-20">
                                    <div className="text-6xl mb-4 italic tracking-widest italic">e</div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Evaluation Node Standby</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completion Milestone CTA */}
                    {enrollment?.progress === 100 && (
                        <div className="m-8 md:m-12 p-12 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-center shadow-[0_50px_100px_rgba(79,70,229,0.2)] border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-white/20 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-8 backdrop-blur-xl">🎓</div>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Curriculum Mastery Achieved</h2>
                                <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base font-bold uppercase tracking-widest mb-10 leading-loose">You have successfully navigated all modules. The final cognitive validation is now unlocked.</p>
                                <button 
                                    onClick={() => navigate(`/quiz/${courseId}`)}
                                    className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                                >
                                    Initiate Final Validation
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Intelligent Curriculum Sidebar */}
                <div className="w-full lg:w-[400px] bg-[#0C132B] border-l border-white/5 flex flex-col h-[calc(100vh-120px)] lg:h-auto overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Curriculum Path</h3>
                            <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded uppercase">{courseData.courseContent?.length || 0} Phases</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Module Progress</span>
                                <span className="text-indigo-400">{enrollment?.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${enrollment?.progress || 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {courseData.courseContent?.map((chapter, chIndex) => (
                            <div key={chIndex} className="border-b border-white/5 transition-all">
                                <div className="px-8 py-5 bg-white/2 hover:bg-white/5 transition-colors group cursor-default">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Phase {String(chIndex + 1).padStart(2, '0')}</p>
                                    <p className="text-sm font-black tracking-tight group-hover:text-white transition-colors">{chapter.chapterTitle}</p>
                                </div>
                                <div className="divide-y divide-white/5 bg-[#060B1A]/40">
                                    {chapter.chapterContent?.map((lecture, lIndex) => (
                                        <button
                                            key={lIndex}
                                            onClick={() => setCurrentLecture(lecture)}
                                            className={`w-full text-left px-8 py-5 flex items-center gap-5 hover:bg-white/5 transition-all relative group ${currentLecture?._id === lecture._id ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            {currentLecture?._id === lecture._id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,1)]"></div>
                                            )}
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${isLectureCompleted(lecture._id)
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                : currentLecture?._id === lecture._id ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
                                                {isLectureCompleted(lecture._id) ? '✓' : String(lIndex + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold leading-snug truncate transition-colors ${currentLecture?._id === lecture._id ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                                                    {lecture.lectureTitle}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{lecture.lectureDuration} MIN</span>
                                                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{isLectureCompleted(lecture._id) ? 'Mastered' : 'Pending'}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
};

export default Player;
