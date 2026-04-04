import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../components/student/Footer';
import Loading from '../../components/student/Loading';
import SearchBar from '../../components/student/SearchBar';
import Rating from '../../components/student/Rating';
import PaymentModal from '../../components/student/PaymentModal';
import { assets } from '../../assets/assets';

const CourseDetails = () => {
    const { id } = useParams();
    const {
        currency, allCourses, calculateRating, calculateNoOfLectures, calculateCourseDuration,
        backendUrl, getHeaders, token, user, settings, navigate
    } = useContext(AppContext);

    const [courseData, setCourseData] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [openChapter, setOpenChapter] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseData();
        fetchReviews();
        fetchDiscussions();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
            if (data.success) {
                setCourseData(data.courseData);
                if (user && data.courseData?.enrolledStudents?.includes(user._id)) {
                    setIsEnrolled(true);
                }
            } else {
                toast.error(data.message || 'Failed to load course');
                console.error('Course Fetch Error:', data.message);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Network error: Failed to load course';
            toast.error(errorMsg);
            console.error('Course Details Fetch Exception:', error);
        }
        setLoading(false);
    };

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/review/course/${id}`);
            if (data.success) setReviews(data.reviews);
        } catch (error) { console.error(error); }
    };

    const fetchDiscussions = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/discussion/course/${id}`);
            if (data.success) setDiscussions(data.comments);
        } catch (error) { console.error(error); }
    };

    const handleEnroll = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            const { data } = await axios.post(`${backendUrl}/api/course/enroll`, { courseId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Enrolled successfully!');
                setIsEnrolled(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to enroll');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !token) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/discussion/add`, {
                courseId: id, message: newComment
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setNewComment('');
                fetchDiscussions();
                toast.success('Comment added');
            }
        } catch (error) { toast.error('Failed to add comment'); }
    };

    const handleAddReview = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            const { data } = await axios.post(`${backendUrl}/api/review/add`, {
                courseId: id, rating: newReview.rating, comment: newReview.comment
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setNewReview({ rating: 5, comment: '' });
                fetchReviews();
                toast.success(data.message);
            }
        } catch (error) { toast.error('Failed to add review'); }
    };

    const toggleChapter = (index) => {
        setOpenChapter(prev => ({ ...prev, [index]: !prev[index] }));
    };

    if (loading) return <Loading />;
    if (!courseData) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-black uppercase tracking-widest">Course not found</div>;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Course Immersive Hero */}
            <div className="bg-[var(--surface)] dark:bg-[#0C132B] pt-36 pb-24 text-[var(--text-main)] dark:text-white relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
                    <nav className="flex items-center gap-3 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]/50 dark:text-white/30">
                        <Link to="/" className="hover:text-[var(--text-main)] dark:hover:text-white transition-colors">Home</Link>
                        <span className="text-[var(--text-muted)]/20 dark:text-white/10">/</span>
                        <Link to="/course-list" className="hover:text-[var(--text-main)] dark:hover:text-white transition-colors">Courses</Link>
                        <span className="text-[var(--text-muted)]/20 dark:text-white/10">/</span>
                        <span className="text-indigo-400">{courseData.category?.name || 'Education'}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-8">
                            <div className="inline-flex items-center gap-2 bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest mb-8 shadow-xl shadow-indigo-500/20">
                                {courseData.level || 'Beginner'}
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-black mb-10 leading-[1.1] tracking-tighter text-[var(--text-main)] dark:text-white">
                                {courseData.courseTitle}
                            </h1>

                            <div className="flex flex-wrap items-center gap-10">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 flex items-center justify-center font-black text-indigo-400 text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        {courseData.instructor?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-muted)]/50 dark:text-white/20 font-black uppercase text-[10px] tracking-widest mb-0.5 leading-none">Instructor</p>
                                        <p className="font-bold text-lg tracking-tight text-[var(--text-main)] dark:text-white">{courseData.instructor?.name || 'Expert Mentor'}</p>
                                    </div>
                                </div>

                                <div className="h-10 w-[1px] bg-[var(--border)] dark:bg-white/10 hidden md:block"></div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 flex items-center justify-center text-amber-400 text-xl shadow-lg">
                                        ★
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-muted)]/50 dark:text-white/20 font-black uppercase text-[10px] tracking-widest mb-0.5 leading-none">Course Rating</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-sm font-bold text-[var(--text-main)] dark:text-white/90">{calculateRating(courseData)}</span>
                                            <span className="text-sm text-[var(--text-muted)] dark:text-white/40">({courseData.courseRatings.length} reviews)</span>
                                        </div>
                                        {!settings?.hide_enrollment && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-400">👤</span>
                                                <span className="text-sm font-bold text-[var(--text-main)] dark:text-white/90">{courseData.enrolledStudents.length} students enrolled</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-10 w-[1px] bg-[var(--border)] dark:bg-white/10 hidden md:block"></div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 flex items-center justify-center text-emerald-400 text-xl">
                                        👥
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-muted)]/50 dark:text-white/20 font-black uppercase text-[10px] tracking-widest mb-0.5 leading-none">Learning Community</p>
                                        <p className="font-black text-lg tracking-tight text-[var(--text-main)] dark:text-white">{courseData.enrolledStudents?.length || 0}+ Members</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 md:px-12 lg:px-24 -mt-12 pb-24 relative z-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column: Content */}
                    <div className="lg:w-2/3">
                        {/* Premium Tabs */}
                        <div className="bg-[var(--surface)]/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-[var(--border)] flex items-center gap-3 overflow-x-auto whitespace-nowrap sticky top-24 z-30 mb-12">
                            {['overview', 'curriculum', 'reviews', 'discussions'].filter(tab => {
                                if (tab === 'reviews' && settings?.hide_review === 'Yes') return false;
                                return true;
                            }).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30' : 'text-[var(--text-muted)] hover:bg-[var(--background)] hover:text-indigo-500'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Card */}
                        <div className="bg-[var(--surface)] rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-indigo-500/5 border border-[var(--border)] min-h-[500px]">
                            {activeTab === 'overview' && (
                                <div className="animate-fadeIn">
                                    <div className="inline-flex items-center gap-2 mb-6">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">Course Syllabus & Vision</h3>
                                    </div>
                                    <div className="text-[var(--text-muted)] font-medium leading-[1.8] text-lg mb-12" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-[var(--border)]">
                                        <div className="flex items-start gap-5 p-8 bg-[var(--background)] rounded-[2rem] border border-[var(--border)]/50 hover:bg-[var(--surface)] hover:shadow-xl transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] flex items-center justify-center text-indigo-500 shadow-sm font-black text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">✓</div>
                                            <div>
                                                <h4 className="font-black text-[var(--text-main)] uppercase tracking-tight mb-1 text-sm">Lifetime Pro Access</h4>
                                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Master skills at your own pace.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-5 p-8 bg-[var(--background)] rounded-[2rem] border border-[var(--border)]/50 hover:bg-[var(--surface)] hover:shadow-xl transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] flex items-center justify-center text-indigo-500 shadow-sm font-black text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">✓</div>
                                            <div>
                                                <h4 className="font-black text-[var(--text-main)] uppercase tracking-tight mb-1 text-sm">Verified Certificate</h4>
                                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Industry-recognized validation.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'curriculum' && (
                                <div className="space-y-10 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Learning Path</span>
                                            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Structured Content</h3>
                                        </div>
                                        <span className="bg-indigo-500/10 text-indigo-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                            {courseData?.courseContent?.length || 0} Modules • {courseData ? calculateNoOfLectures(courseData) : 0} Lessons
                                        </span>
                                    </div>
                                    <div className="space-y-6">
                                        {courseData.courseContent?.map((chapter, index) => (
                                            <div key={index} className="border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                <button
                                                    onClick={() => toggleChapter(index)}
                                                    className={`w-full flex items-center justify-between p-8 transition-all ${openChapter[index] ? 'bg-[var(--background)] border-b border-[var(--border)]' : 'bg-[var(--surface)] hover:bg-[var(--background)]'}`}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${openChapter[index] ? 'bg-indigo-500 text-white' : 'bg-[var(--background)] text-[var(--text-muted)]'}`}>
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-black text-[var(--text-main)] text-xl tracking-tight">{chapter.chapterTitle}</span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-bold text-xl transition-all">
                                                        {openChapter[index] ? '−' : '+'}
                                                    </div>
                                                </button>
                                                {openChapter[index] && (
                                                    <div className="p-4 bg-[var(--background)]/50">
                                                        <div className="space-y-2">
                                                            {chapter.chapterContent?.map((lecture, lIndex) => (
                                                                <div key={lIndex} className="flex items-center justify-between p-4 px-6 rounded-2xl hover:bg-[var(--surface)] hover:shadow-lg transition-all group/lec cursor-pointer border border-transparent hover:border-[var(--border)]">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center text-indigo-500 shadow-sm font-black text-xs group-hover/lec:bg-indigo-500 group-hover/lec:text-white transition-all">
                                                                            ▶
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-black text-[var(--text-main)] tracking-tight">{lecture.lectureTitle}</span>
                                                                            {lecture.isPreviewFree && (
                                                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Free Access</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{lecture.lectureDuration} Min</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-16 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-12">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Feedback Hub</span>
                                            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Student Experience</h3>
                                        </div>
                                        <div className="flex items-center gap-5 bg-amber-500/10 px-8 py-4 rounded-[2rem] border border-amber-500/20">
                                            <span className="text-4xl font-black text-amber-600 dark:text-amber-400 leading-none">{calculateRating(courseData) || '4.5'}</span>
                                            <div className="flex flex-col">
                                                <div className="flex text-amber-500 text-lg">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">Avg. Course Rating</span>
                                            </div>
                                        </div>
                                    </div>

                                    {user && isEnrolled && (
                                        <div className="p-10 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <h4 className="font-black text-[var(--text-main)] mb-8 uppercase tracking-widest text-xs">Post your perspective</h4>
                                                <div className="flex items-center gap-4 mb-8">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                            className={`text-4xl transition-all hover:scale-125 ${star <= newReview.rating ? 'text-amber-500 drop-shadow-sm' : 'text-[var(--text-muted)]/20'}`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={newReview.comment}
                                                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                                    className="w-full bg-[var(--background)] border-none rounded-[1.5rem] p-8 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-[var(--text-muted)]/40 text-[var(--text-main)] mb-8 shadow-sm"
                                                    rows={4}
                                                    placeholder="Share your learning journey with others..."
                                                />
                                                <button onClick={handleAddReview} className="btn-primary w-full sm:w-auto px-12">Publish Review</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-12">
                                        {reviews.map((review) => (
                                            <div key={review._id} className="flex flex-col sm:flex-row gap-8 pb-12 border-b border-[var(--border)] last:border-0 group">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--background)] flex-shrink-0 flex items-center justify-center text-[var(--text-muted)] font-black text-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm border border-[var(--border)]">
                                                    {review.userId?.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="flex-grow text-left">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h5 className="font-black text-[var(--text-main)] uppercase tracking-tight text-lg">{review.userId?.name}</h5>
                                                        <div className="flex text-amber-500 text-sm">
                                                            {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                                                        </div>
                                                    </div>
                                                    <p className="text-[var(--text-muted)] font-medium leading-relaxed italic text-lg opacity-80">"{review.comment}"</p>
                                                </div>
                                            </div>
                                        ))}
                                        {reviews.length === 0 && (
                                            <div className="text-center py-20 grayscale opacity-30">
                                                <div className="text-6xl mb-6">💬</div>
                                                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">No student feedback yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'discussions' && (
                                <div className="space-y-16 animate-fadeIn">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Knowledge Exchange</span>
                                            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Community Board</h3>
                                        </div>
                                    </div>

                                    {user && (
                                        <div className="flex gap-8 p-10 bg-[var(--surface)] dark:bg-[#0C132B] rounded-[2.5rem] mb-16 shadow-2xl overflow-hidden relative border border-[var(--border)] transition-all">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"></div>
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex-shrink-0 items-center justify-center text-white font-black text-2xl hidden sm:flex">
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="flex-grow space-y-6 relative z-10">
                                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Post a new inquiry</h4>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    className="w-full bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:border-indigo-500/50 text-[var(--text-main)] dark:text-white placeholder:text-[var(--text-muted)]/40 dark:placeholder:text-white/20"
                                                    rows={3}
                                                    placeholder="Stuck on a lesson? Ask the community..."
                                                />
                                                <button onClick={handleAddComment} className="btn-primary px-10">Ask Question</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-16">
                                        {discussions.map((comment) => (
                                            <div key={comment._id} className="relative">
                                                <div className="flex gap-6 mb-8">
                                                    <div className="w-14 h-14 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex-shrink-0 flex items-center justify-center font-black text-[var(--text-main)] shadow-sm">
                                                        {comment.userId?.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <span className="font-black text-[var(--text-main)] uppercase tracking-tight text-lg leading-none">{comment.userId?.name}</span>
                                                            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]/40">
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[var(--text-muted)] font-medium text-lg leading-relaxed">{comment.message}</p>
                                                    </div>
                                                </div>

                                                {comment.replies?.length > 0 && (
                                                    <div className="ml-10 sm:ml-20 mt-10 space-y-10 border-l-4 border-[var(--border)] pl-10">
                                                        {comment.replies.map(reply => (
                                                            <div key={reply._id} className="flex gap-4 group">
                                                                <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex-shrink-0 flex items-center justify-center font-black text-[10px] text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                                    {reply.userId?.name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="font-black text-[var(--text-main)] text-sm leading-none uppercase tracking-tighter">{reply.userId?.name}</span>
                                                                        <span className="text-[9px] font-black uppercase text-[var(--text-muted)]/40 tracking-widest">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed">{reply.message}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Enrollment Sidebar */}
                    <aside className="lg:w-1/3">
                        <div className="sticky top-24 z-40">
                            <div className="bg-[var(--surface)] rounded-[3rem] shadow-[0_50px_100px_rgba(79,70,229,0.1)] overflow-hidden border border-[var(--border)]">
                                <div className="relative aspect-video rounded-3xl overflow-hidden m-4 group">
                                    <img
                                        src={courseData.courseThumbnail || assets.placeholder}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#0C132B] dark:text-gray-900 text-2xl shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                            ▶
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-4 bg-[#7C32FF] text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-xl">
                                        {courseData.coursePrice === 0 ? 'Free Lesson' : 'Premium Course'}
                                    </div>
                                </div>

                                <div className="p-10 pt-4 space-y-10 text-left">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-5xl font-black text-[var(--text-main)] tracking-tighter">
                                                {courseData.coursePrice === 0 ? 'Free' : `${currency}${((courseData.coursePrice || 0) - (courseData.discount || 0) * (courseData.coursePrice || 0) / 100).toFixed(0)}`}
                                            </span>
                                            {courseData.discount > 0 && (
                                                <span className="text-xl text-[var(--text-muted)]/40 line-through font-bold">
                                                    {currency}{courseData.coursePrice}
                                                </span>
                                            )}
                                        </div>
                                        {courseData.discount > 0 && (
                                            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full">
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Limited Offer: Save {courseData.discount}%</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {isEnrolled ? (
                                            <button
                                                onClick={() => navigate(`/player/${courseData._id}`)}
                                                className="w-full bg-[var(--text-main)] dark:bg-indigo-600 text-[var(--background)] transform hover:scale-[1.02] dark:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-4 group"
                                            >
                                                Resuming Learning
                                                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        ) : (
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => {
                                                        if (!token) { navigate('/login'); return; }
                                                        if (courseData.coursePrice === 0) {
                                                            handleEnroll();
                                                        } else {
                                                            setIsPaymentModalOpen(true);
                                                        }
                                                    }}
                                                    className="w-full bg-[var(--text-main)] dark:bg-indigo-600 text-[var(--background)] dark:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl"
                                                >
                                                    Enroll In Course
                                                </button>
                                                <button className="w-full bg-transparent text-[var(--text-main)] border-2 border-[var(--border)] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--background)] transition-all">
                                                    Save to Wishlist
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-10 border-t border-[var(--border)] grid grid-cols-3 gap-6 text-center">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Lectures</span>
                                            <span className="text-xl font-black text-[var(--text-main)] tracking-tight">{courseData ? calculateNoOfLectures(courseData) : 0}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Time</span>
                                            <span className="text-xl font-black text-[var(--text-main)] tracking-tight">{courseData ? calculateCourseDuration(courseData) : '0h'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Access</span>
                                            <span className="text-xl font-black text-[var(--text-main)] tracking-tight">Full</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-10 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">30-Day Happiness Guarantee</p>
                                    </div>
                                    {/* Share & Social */}
                                    {!settings?.hide_social && (
                                        <div className="pt-6 border-t border-[var(--border)] w-full">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 text-center">Share this learning journey</p>
                                            <div className="flex justify-center gap-3">
                                                <button className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-500/10 transition-all">f</button>
                                                <button className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-sky-400 hover:bg-sky-500/10 transition-all">t</button>
                                                <button className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">i</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                course={courseData}
                onPaymentSuccess={fetchCourseData}
            />

            <Footer />
        </div>
    );
};

export default CourseDetails;
