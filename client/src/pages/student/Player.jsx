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
                courseId, lessonId: lectureId
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                setEnrollment(data.enrollment);
                toast.success('Progress updated!');
            }
        } catch (error) {
            toast.error('Failed to update progress');
        }
    };

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
                    <div className="aspect-video bg-[#060B1A] relative group">
                        {currentLecture?.lectureUrl ? (
                            currentLecture.lectureUrl.includes('youtube.com') || currentLecture.lectureUrl.includes('youtu.be') ? (
                                <iframe
                                    className="w-full h-full"
                                    src={getYoutubeUrl(currentLecture.lectureUrl)}
                                    allowFullScreen
                                    title={currentLecture.lectureTitle}
                                />
                            ) : (
                                <video 
                                    className="w-full h-full" 
                                    controls={settings?.show_seekbar === 'Yes'} 
                                    controlsList={settings?.show_seekbar === 'No' ? 'noplaybackrate' : ''}
                                    src={currentLecture.lectureUrl} 
                                />
                            )
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-3xl mb-6">📽️</div>
                                <h3 className="text-xl font-black tracking-tight">Select a Chapter</h3>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs">Your journey begins when you choose a path from the curriculum.</p>
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
