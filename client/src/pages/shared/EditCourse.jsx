import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';

const generateId = () => Math.random().toString(36).substring(2, 9);

const EditCourse = ({ isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, token, categories } = useContext(AppContext);
    const quillRef = useRef(null);
    const editorRef = useRef(null);

    const [activeTab, setActiveTab] = useState('basic');
    const [courseTitle, setCourseTitle] = useState('');
    const [coursePrice, setCoursePrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [category, setCategory] = useState('');
    const [courseLevel, setCourseLevel] = useState('Beginner');
    const [courseLanguage, setCourseLanguage] = useState('English');
    const [coursePreviewVideo, setCoursePreviewVideo] = useState('');
    const [courseOutcomes, setCourseOutcomes] = useState(['']);
    const [courseRequirements, setCourseRequirements] = useState(['']);
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState('');
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!quillRef.current && editorRef.current && !loading) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: 'Refine the module description...'
            });
        }
    }, [loading, activeTab]);

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
            if (data.success) {
                const course = data.courseData;
                setCourseTitle(course.courseTitle);
                setCoursePrice(course.coursePrice);
                setDiscount(course.discount || 0);
                setCategory(course.category?._id || course.category);
                setCourseLevel(course.level || 'Beginner');
                setCourseLanguage(course.courseLanguage || 'English');
                setCoursePreviewVideo(course.coursePreviewVideo || '');
                setCourseOutcomes(course.courseOutcomes?.length > 0 ? course.courseOutcomes : ['']);
                setCourseRequirements(course.courseRequirements?.length > 0 ? course.courseRequirements : ['']);
                setExistingImage(course.courseThumbnail);
                setChapters(course.courseContent || []);
                if (quillRef.current) {
                    quillRef.current.root.innerHTML = course.courseDescription || '';
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Data retrieval failed');
        }
        setLoading(false);
    };

    const addChapter = () => {
        setChapters([...chapters, {
            chapterId: generateId(),
            chapterTitle: '',
            chapterOrder: chapters.length,
            chapterContent: [],
            collapsed: false
        }]);
    };

    const addLecture = (chapterIndex) => {
        const updated = [...chapters];
        updated[chapterIndex].chapterContent.push({
            lectureId: generateId(),
            lectureTitle: '',
            lectureDuration: 0,
            lectureUrl: '',
            isPreviewFree: false,
            lectureOrder: updated[chapterIndex].chapterContent.length
        });
        setChapters(updated);
    };

    const updateChapter = (index, field, value) => {
        const updated = [...chapters];
        updated[index][field] = value;
        setChapters(updated);
    };

    const updateLecture = (chIndex, lecIndex, field, value) => {
        const updated = [...chapters];
        updated[chIndex].chapterContent[lecIndex][field] = value;
        setChapters(updated);
    };

    const removeChapter = (index) => {
        setChapters(chapters.filter((_, i) => i !== index));
    };

    const removeLecture = (chIndex, lecIndex) => {
        const updated = [...chapters];
        updated[chIndex].chapterContent = updated[chIndex].chapterContent.filter((_, i) => i !== lecIndex);
        setChapters(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!courseTitle || !category) {
            toast.error('Fundamental parameters required');
            return;
        }

        const description = quillRef.current ? quillRef.current.root.innerHTML : '';
        const courseData = {
            courseTitle,
            courseDescription: description,
            coursePrice: Number(coursePrice),
            discount: Number(discount),
            category,
            level: courseLevel,
            courseLanguage,
            coursePreviewVideo,
            courseOutcomes: courseOutcomes.filter(o => o.trim() !== ''),
            courseRequirements: courseRequirements.filter(r => r.trim() !== ''),
            courseContent: chapters.map((ch, i) => ({
                chapterTitle: ch.chapterTitle,
                chapterOrder: i,
                chapterContent: ch.chapterContent.map((lec, j) => ({
                    lectureTitle: lec.lectureTitle,
                    lectureDuration: Number(lec.lectureDuration),
                    lectureUrl: lec.lectureUrl,
                    isPreviewFree: lec.isPreviewFree,
                    lectureOrder: j
                }))
            }))
        };

        const formData = new FormData();
        formData.append('courseData', JSON.stringify(courseData));
        if (image) formData.append('image', image);

        setSaving(true);
        try {
            const url = isAdmin 
                ? `${backendUrl}/api/admin/courses/${id}`
                : `${backendUrl}/api/instructor/update-course/${id}`;

            const { data } = await axios.put(url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Course Identity Synchronized');
                navigate(isAdmin ? '/admin/courses' : '/educator/my-courses');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Synchronization Failure');
        }
        setSaving(false);
    };

    const StepIcon = ({ step, label, current }) => (
        <button 
            type="button"
            onClick={() => setActiveTab(step)}
            className={`flex flex-col items-center gap-4 group transition-all ${current === step ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${current === step ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'bg-gray-100 text-gray-400'}`}>
                {step === 'basic' ? '01' : step === 'details' ? '02' : step === 'curriculum' ? '03' : '04'}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50/50">
            <div className="w-12 h-12 border-4 border-[#0C132B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C132B]/40">Decrypting Module...</p>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-rose-500' : 'bg-indigo-500'}`}></span>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                {isAdmin ? 'SuperAdmin Intervention' : 'Instructor Revision'}
                            </p>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Modify Module</h1>
                    </div>
                    
                    <div className="flex items-center gap-8 bg-white px-10 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50">
                        <StepIcon step="basic" label="Foundations" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="details" label="Dynamics" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="curriculum" label="Modules" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="metadata" label="Economics" current={activeTab} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {activeTab === 'basic' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Core Foundations</h2>
                            <div className="grid gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Refined Title</label>
                                    <input 
                                        type="text" 
                                        value={courseTitle} 
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all font-inter"
                                        placeholder="Enter refined title" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Module Description</label>
                                    <div className="bg-gray-50/50 border border-gray-100 rounded-[1.5rem] overflow-hidden min-h-[300px]">
                                        <div ref={editorRef}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Intellectual Domain</label>
                                        <select 
                                            value={category} 
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none appearance-none hover:bg-white transition-colors" 
                                            required
                                        >
                                            <option value="">Select Domain</option>
                                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complexity Level</label>
                                        <select
                                            value={courseLevel}
                                            onChange={(e) => setCourseLevel(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none appearance-none hover:bg-white transition-colors"
                                            required
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructional Language</label>
                                        <input
                                            type="text"
                                            value={courseLanguage}
                                            onChange={(e) => setCourseLanguage(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none transition-all"
                                            placeholder="e.g. English, Hindi"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Identity</label>
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-24 h-16 rounded-xl overflow-hidden shadow-lg shadow-black/5 flex-shrink-0">
                                                <img src={existingImage || 'https://via.placeholder.com/120x80'} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <span className="text-[8px] font-bold text-white uppercase">Current</span>
                                                </div>
                                            </div>
                                            <div className="relative flex-1 h-[64px]">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => setImage(e.target.files[0])}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                />
                                                <div className="absolute inset-0 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[1.5rem] flex items-center px-6 gap-4 text-gray-400">
                                                    <span className="text-xl">🔄</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{image ? image.name : 'Update Visual Asset'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preview Nexus (Promo Video URL)</label>
                                        <input
                                            type="text"
                                            value={coursePreviewVideo}
                                            onChange={(e) => setCoursePreviewVideo(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none transition-all"
                                            placeholder="YouTube/Vimeo URL"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-10">
                                    <button type="button" onClick={() => setActiveTab('details')} className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-black/10">
                                        Dynamics Review →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Knowledge Dynamics</h2>
                            
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Learning Outcomes</label>
                                        <button type="button" onClick={() => setCourseOutcomes([...courseOutcomes, ''])} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">+ Append Outcome</button>
                                    </div>
                                    <div className="grid gap-4">
                                        {courseOutcomes.map((outcome, index) => (
                                            <div key={index} className="flex gap-4">
                                                <input
                                                    type="text"
                                                    value={outcome}
                                                    onChange={(e) => {
                                                        const updated = [...courseOutcomes];
                                                        updated[index] = e.target.value;
                                                        setCourseOutcomes(updated);
                                                    }}
                                                    className="flex-1 bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white transition-all"
                                                    placeholder="e.g. Master Neural Architectures"
                                                />
                                                {courseOutcomes.length > 1 && (
                                                    <button type="button" onClick={() => setCourseOutcomes(courseOutcomes.filter((_, i) => i !== index))} className="w-12 h-12 rounded-xl hover:bg-rose-50 text-rose-400 text-lg transition-colors flex items-center justify-center">×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Functional Prerequisites</label>
                                        <button type="button" onClick={() => setCourseRequirements([...courseRequirements, ''])} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">+ Append Requirement</button>
                                    </div>
                                    <div className="grid gap-4">
                                        {courseRequirements.map((req, index) => (
                                            <div key={index} className="flex gap-4">
                                                <input
                                                    type="text"
                                                    value={req}
                                                    onChange={(e) => {
                                                        const updated = [...courseRequirements];
                                                        updated[index] = e.target.value;
                                                        setCourseRequirements(updated);
                                                    }}
                                                    className="flex-1 bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white transition-all"
                                                    placeholder="e.g. Proficiency in Linear Algebra"
                                                />
                                                {courseRequirements.length > 1 && (
                                                    <button type="button" onClick={() => setCourseRequirements(courseRequirements.filter((_, i) => i !== index))} className="w-12 h-12 rounded-xl hover:bg-rose-50 text-rose-400 text-lg transition-colors flex items-center justify-center">×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-10">
                                <button type="button" onClick={() => setActiveTab('basic')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors">← Regress to Foundations</button>
                                <button type="button" onClick={() => setActiveTab('curriculum')} className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-black/10">
                                    Evolve to Architecture →
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-[#0C132B] tracking-tight">Module Architecture</h2>
                                <button type="button" onClick={addChapter} className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0C132B] transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3">
                                    <span>Deploy Phase</span>
                                    <span>+</span>
                                </button>
                            </div>

                            {chapters.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
                                    <div className="text-6xl mb-8 grayscale opacity-20">🧩</div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Curriculum is Empty</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {chapters.map((chapter, chIndex) => (
                                        <div key={chIndex} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-gray-50">
                                            <div className="bg-gray-50/50 px-10 py-8 flex items-center justify-between gap-6 border-b border-gray-100">
                                                <div className="flex items-center gap-6 flex-1">
                                                    <span className="w-10 h-10 bg-[#0C132B] text-white rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0">P{chIndex + 1}</span>
                                                    <input 
                                                        type="text" 
                                                        value={chapter.chapterTitle} 
                                                        onChange={(e) => updateChapter(chIndex, 'chapterTitle', e.target.value)}
                                                        className="flex-1 bg-transparent text-lg font-black text-[#0C132B] tracking-tight outline-none focus:text-indigo-500 transition-colors"
                                                        placeholder="Phase Title" 
                                                    />
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <button type="button" onClick={() => addLecture(chIndex)} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-[#0C132B] transition-colors">Append Nexus</button>
                                                    <button type="button" onClick={() => removeChapter(chIndex)} className="w-8 h-8 rounded-full hover:bg-rose-50 text-rose-400 text-lg transition-colors flex items-center justify-center">×</button>
                                                </div>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {chapter.chapterContent.map((lecture, lecIndex) => (
                                                    <div key={lecIndex} className="px-10 py-10 flex flex-wrap lg:flex-nowrap items-center gap-8 bg-white/50 group">
                                                        <span className="text-[10px] font-black text-gray-300 w-8">{String(lecIndex + 1).padStart(2, '0')}</span>
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[300px]">
                                                            <input 
                                                                type="text" 
                                                                value={lecture.lectureTitle} 
                                                                onChange={(e) => updateLecture(chIndex, lecIndex, 'lectureTitle', e.target.value)}
                                                                className="w-full bg-gray-50/50 p-4 rounded-xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                                placeholder="Knowledge Nexus Title" 
                                                            />
                                                            <input 
                                                                type="text" 
                                                                value={lecture.lectureUrl} 
                                                                onChange={(e) => updateLecture(chIndex, lecIndex, 'lectureUrl', e.target.value)}
                                                                className="w-full bg-gray-50/50 p-4 rounded-xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                                placeholder="Streaming Repository (YouTube URL)" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-6 w-full lg:w-auto">
                                                            <div className="relative">
                                                                <input 
                                                                    type="number" 
                                                                    value={lecture.lectureDuration} 
                                                                    onChange={(e) => updateLecture(chIndex, lecIndex, 'lectureDuration', e.target.value)}
                                                                    className="w-32 bg-gray-50/50 p-4 pl-12 rounded-xl text-xs font-bold text-[#0C132B] outline-none"
                                                                    placeholder="Min" 
                                                                    min="0" 
                                                                />
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs">⏱️</span>
                                                            </div>
                                                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={lecture.isPreviewFree} 
                                                                    onChange={(e) => updateLecture(chIndex, lecIndex, 'isPreviewFree', e.target.checked)}
                                                                    className="w-4 h-4 rounded border-gray-200 text-indigo-500 focus:ring-indigo-500"
                                                                />
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Public</span>
                                                            </label>
                                                            <button type="button" onClick={() => removeLecture(chIndex, lecIndex)} className="w-10 h-10 rounded-xl hover:bg-rose-50 text-rose-400 transition-all flex items-center justify-center">✕</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-10">
                                <button type="button" onClick={() => setActiveTab('details')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors">← Regress to Dynamics</button>
                                <button type="button" onClick={() => setActiveTab('metadata')} className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-black/10">
                                    Proceed to Economics →
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'metadata' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Economic Calibration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Acquisition Threshold (Price)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={coursePrice} 
                                            onChange={(e) => setCoursePrice(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 pl-16 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none" 
                                            min="0" 
                                        />
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">$</span>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2">Set to zero for unrestricted entry.</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Incentive (Discount %)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={discount} 
                                            onChange={(e) => setDiscount(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 pl-16 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none" 
                                            min="0" 
                                            max="100" 
                                        />
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-20 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex flex-col">
                                    <h4 className="text-base font-black text-[#0C132B] tracking-tight mb-1">Final Authorization</h4>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">By authorizing these modifications, you confirm compliance with institutional standards.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button 
                                        type="button"
                                        onClick={() => navigate(isAdmin ? '/admin/courses' : '/educator/my-courses')}
                                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                    >
                                        Abandon Changes
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="bg-[#0C132B] text-white px-16 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-black/10 disabled:opacity-50 min-w-[280px]"
                                    >
                                        {saving ? 'Transmitting Data...' : 'Synchronize Identity'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-12 text-center">
                                <button type="button" onClick={() => setActiveTab('curriculum')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors">← Regress to Architecture</button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditCourse;
