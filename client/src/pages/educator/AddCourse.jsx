import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import axios from 'axios';
const generateId = () => Math.random().toString(36).substring(2, 9);
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Line } from 'rc-progress';
import { 
    LayoutDashboard, 
    FileText, 
    Video, 
    Download, 
    Plus, 
    Trash2, 
    ChevronDown, 
    ChevronUp, 
    Settings, 
    Award, 
    Youtube, 
    UploadCloud, 
    ClipboardList,
    FileDown,
    Clock,
    Link,
    Search,
    Sparkles
} from 'lucide-react';


const AddCourse = () => {
    const { categories } = useContext(AppContext);
    const quillRef = useRef(null);
    const editorRef = useRef(null);

    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);

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
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({}); // { lectureId: progress }
    const [isUploading, setIsUploading] = useState(false);
    const [isCertificateEnabled, setIsCertificateEnabled] = useState(true);
    const [isQuizEnabled, setIsQuizEnabled] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [issueMethod, setIssueMethod] = useState('quiz'); // 'quiz' or 'completion'
    const [templates, setTemplates] = useState([]);
    const [courseDescription, setCourseDescription] = useState('');
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const { data } = await api.get('/finance/certificate-templates');
                if (data.success) {
                    setTemplates(data.templates);
                    // Set default template if exists
                    const defaultTemp = data.templates.find(t => t.isDefault);
                    if (defaultTemp) setSelectedTemplate(defaultTemp._id);
                    else if (data.templates.length > 0) setSelectedTemplate(data.templates[0]._id);
                }
            } catch (error) {
                console.error("Failed to load templates", error);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (activeTab === 'basic' && editorRef.current) {
            // Re-initialize on every mount of the basic tab to ensure it's attached to the new DOM element
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: 'Articulate the essence of your module...'
            });
            
            // Populate with current state
            quillRef.current.root.innerHTML = courseDescription;

            // Sync changes back to state
            quillRef.current.on('text-change', () => {
                setCourseDescription(quillRef.current.root.innerHTML);
            });
        }
    }, [activeTab]);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            fetchCourseDetails(id);
        }
    }, [id]);

    const fetchCourseDetails = async (courseId) => {
        try {
            const { data } = await api.get(`/instructor/course/${courseId}`);
            if (data.success) {
                const course = data.courseData;
                setCourseTitle(course.courseTitle);
                setCoursePrice(course.coursePrice);
                setDiscount(course.discount);
                setCategory(course.category?._id || course.category);
                setCourseLevel(course.level || 'Beginner');
                setCourseLanguage(course.courseLanguage || 'English');
                setCourseDescription(course.courseDescription || '');
                setCoursePreviewVideo(course.coursePreviewVideo || '');
                setCourseOutcomes(course.courseOutcomes?.length ? course.courseOutcomes : ['']);
                setCourseRequirements(course.courseRequirements?.length ? course.courseRequirements : ['']);
                setChapters(course.courseContent || []);
                if (course.isCertificateEnabled !== undefined) setIsCertificateEnabled(course.isCertificateEnabled);
                if (course.isQuizEnabled !== undefined) setIsQuizEnabled(course.isQuizEnabled);
                if (course.issueMethod) setIssueMethod(course.issueMethod);
                if (course.certificateTemplate) setSelectedTemplate(course.certificateTemplate);
                
                // Fetch Assignments for the course
                fetchAssignments(courseId);
            }
        } catch (error) {
            toast.error('Failed to load course details');
        }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const { data } = await api.get(`/assignment/course/${courseId}`);
            if (data.success) {
                // Map to ensure date format is correct for input[type="date"]
                const mapped = data.assignments.map(a => ({
                    ...a,
                    deadline: a.deadline ? new Date(a.deadline).toISOString().split('T')[0] : ''
                }));
                setAssignments(mapped);
            }
        } catch (error) {
            console.error("Failed to load assignments", error);
        }
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
            lectureDescription: '',
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

    const handleVideoUpload = async (chIndex, lecIndex, file) => {
        if (!file) return;
        if (file.type !== 'video/mp4') {
            toast.error('Only MP4 format is authorized for manual uploads.');
            return;
        }

        const lectureId = chapters[chIndex].chapterContent[lecIndex].lectureId;
        setIsUploading(true);
        setUploadProgress(prev => ({ ...prev, [lectureId]: 5 }));

        try {
            // 1. Get Signature
            const { data: sigData } = await api.get('/comm/upload-signature');

            if (!sigData.success) throw new Error('Signature acquisition failed.');

            // 2. Transmit to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', sigData.api_key);
            formData.append('timestamp', sigData.timestamp);
            formData.append('signature', sigData.signature);
            formData.append('folder', sigData.folder);

            const { data: uploadData } = await axios.post(
                `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/video/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(prev => ({ ...prev, [lectureId]: progress }));
                    }
                }
            );

            // 3. Update State
            updateLecture(chIndex, lecIndex, 'lectureUrl', uploadData.secure_url);
            updateLecture(chIndex, lecIndex, 'lectureDuration', Math.round(uploadData.duration / 60));
            toast.success('Asset Transmitted Successfully');
        } catch (error) {
            console.error(error);
            toast.error('Asset Transmission Failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[lectureId];
                return newProgress;
            });
        }
    };

    const handleAttachmentUpload = async (chIndex, lecIndex, file) => {
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.post('/instructor/upload-image', formData);
            if (data.success) {
                const currentAttachments = chapters[chIndex].chapterContent[lecIndex].attachments || [];
                const updated = [...chapters];
                updated[chIndex].chapterContent[lecIndex].attachments = [...currentAttachments, {
                    fileName: file.name,
                    fileUrl: data.url
                }];
                setChapters(updated);
                toast.success('Asset Transmitted');
            }
        } catch (error) {
            toast.error('Transmission Failure');
        } finally {
            setIsUploading(false);
        }
    };

    const removeAttachment = (chIndex, lecIndex, attIndex) => {
        const updated = [...chapters];
        updated[chIndex].chapterContent[lecIndex].attachments = updated[chIndex].chapterContent[lecIndex].attachments.filter((_, i) => i !== attIndex);
        setChapters(updated);
    };


    const addAssignment = () => {
        setAssignments([...assignments, {
            title: '',
            description: '',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalMarks: 100
        }]);
    };

    const handleUpdateAssignment = (index, field, value) => {
        const updated = [...assignments];
        updated[index][field] = value;
        setAssignments(updated);
    };

    const removeAssignment = (index) => {
        setAssignments(assignments.filter((_, i) => i !== index));
    };

    const saveAssignments = async (courseId) => {
        try {
            for (const assignment of assignments) {
                if (assignment._id) {
                    await api.put(`/assignment/${assignment._id}`, assignment);
                } else {
                    await api.post('/assignment/create', { ...assignment, courseId });
                }
            }
        } catch (error) {
            console.error("Critical Assessment Sync Failure:", error);
            toast.error("Modules updated, but some assessments failed to synchronize.");
        }
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
            toast.error('Required fields are missing');
            return;
        }

        const courseData = {
            courseTitle,
            courseDescription,
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
                    lectureDescription: lec.lectureDescription || '',
                    lectureDuration: Number(lec.lectureDuration),
                    lectureUrl: lec.lectureUrl,
                    isPreviewFree: lec.isPreviewFree,
                    lectureOrder: j,
                    attachments: lec.attachments || []
                }))
            })),
            isCertificateEnabled,
            isQuizEnabled,
            certificateTemplate: selectedTemplate,
            issueMethod
        };

        const formData = new FormData();
        formData.append('courseData', JSON.stringify(courseData));
        if (image) formData.append('image', image);

        setLoading(true);
        try {
            const url = isEditMode ? `/instructor/update-course/${id}` : `/instructor/add-course`;
            const method = isEditMode ? 'put' : 'post';
            const { data } = await api[method](url, formData);
            const targetCourseId = isEditMode ? id : data.courseId;
            if (!targetCourseId) {
                console.error("Course ID missing for assignment sync");
                toast.error("Critical error: Course ID synchronization failed.");
                return;
            }
            if (data.success) {
                await saveAssignments(targetCourseId);

                toast.success(isEditMode ? 'Course Updated' : 'Course Saved');
                if (!isEditMode) {
                    setCourseTitle('');
                    setCoursePrice(0);
                    setDiscount(0);
                    setCategory('');
                    setImage(null);
                    setChapters([]);
                    if (quillRef.current) quillRef.current.root.innerHTML = '';
                    setIsCertificateEnabled(true);
                    setIsQuizEnabled(true);
                    setIssueMethod('quiz');
                    setActiveTab('basic');
                } else {
                    navigate('/educator/my-courses');
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(`Deployment Failure: ${error.message}`);
        }
        setLoading(false);
    };

    const StepIcon = ({ step, label, current }) => (
        <button
            type="button"
            onClick={() => setActiveTab(step)}
            className={`flex flex-col items-center gap-4 group transition-all ${current === step ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${current === step ? 'bg-[#0C132B] text-white shadow-xl shadow-black/10' : 'bg-gray-100 text-gray-400'}`}>
                {step === 'basic' ? '01' : step === 'details' ? '02' : step === 'curriculum' ? '03' : step === 'certification' ? '04' : '05'}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Course Creation</p>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">{isEditMode ? 'Update Course' : 'Create Course'}</h1>
                    </div>

                    <div className="flex items-center gap-8 bg-white px-10 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50">
                        <StepIcon step="basic" label="Foundations" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="details" label="Dynamics" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="curriculum" label="Modules" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="certification" label="Credentials" current={activeTab} />
                        <div className="w-8 h-px bg-gray-100"></div>
                        <StepIcon step="metadata" label="Economics" current={activeTab} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {activeTab === 'basic' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Basic Information</h2>
                            <div className="grid gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
                                    <input
                                        type="text"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all"
                                        placeholder="e.g. Advanced Neural Architectures"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Description</label>
                                    <div className="bg-gray-50/50 border border-gray-100 rounded-[1.5rem] overflow-hidden min-h-[300px]">
                                        <div ref={editorRef}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none appearance-none hover:bg-white transition-colors"
                                            required
                                        >
                                            <option value="">Select Category</option>
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Thumbnail</label>
                                        <div className="relative h-[72px]">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImage(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="absolute inset-0 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[1.5rem] flex items-center px-6 gap-4 text-gray-400 group-hover:border-indigo-500/50 transition-all">
                                                <span className="text-xl">🖼️</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest truncate">{image ? image.name : 'Upload Thumbnail Asset'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Promo Video URL</label>
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
                                        Proceed to Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Course Details</h2>
                            
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prerequisites</label>
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
                                <button type="button" onClick={() => setActiveTab('basic')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors">← Back to Overview</button>
                                <button type="button" onClick={() => setActiveTab('curriculum')} className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-black/10">
                                    Next: Curriculum →
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-[#0C132B] tracking-tight">Course Curriculum</h2>
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button" 
                                        onClick={async () => {
                                            if (!courseTitle) {
                                                toast.error("Set a Module Title first to guide the AI.");
                                                return;
                                            }
                                            setLoading(true);
                                            try {
                                                const { data } = await api.post('/ai/generate-outline', { 
                                                    title: courseTitle, 
                                                    category: categories.find(c => c._id === category)?.name || category 
                                                });
                                                if (data.success) {
                                                    const aiChapters = data.data.chapters.map(ch => ({
                                                        chapterId: Math.random().toString(36).substring(2, 9),
                                                        chapterTitle: ch.chapterTitle,
                                                        chapterOrder: 0,
                                                        chapterContent: ch.chapterContent.map(lec => ({
                                                            lectureId: Math.random().toString(36).substring(2, 9),
                                                            lectureTitle: lec.lectureTitle,
                                                            lectureDescription: lec.lectureDescription || '',
                                                            lectureDuration: lec.lectureDuration || 15,
                                                            lectureUrl: '',
                                                            isPreviewFree: false,
                                                            lectureOrder: 0
                                                        })),
                                                        collapsed: false
                                                    }));
                                                    setChapters(aiChapters);
                                                    toast.success("Course Saved");
                                                } else {
                                                    toast.error(data.message || "AI Generator Busy");
                                                }
                                            } catch (error) {
                                                toast.error("AI Synchronization Failed");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }} 
                                        disabled={loading}
                                        className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-xl shadow-emerald-500/5 flex items-center gap-3"
                                    >
                                        <span>✨ AI Smart Outline</span>
                                    </button>
                                    <button type="button" onClick={addChapter} className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0C132B] transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3">
                                        <span>Append Phase</span>
                                        <span>+</span>
                                    </button>
                                </div>
                            </div>

                            {chapters.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
                                    <div className="text-6xl mb-8 grayscale opacity-20">🧩</div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No Chapters Found</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {chapters.map((chapter, chIndex) => (
                                        <div key={chapter.chapterId || chapter._id || chIndex} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-gray-50">
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
                                                    <button type="button" onClick={() => removeChapter(chIndex)} className="w-8 h-8 rounded-full hover:bg-rose-50 text-rose-400 text-lg transition-colors overflow-hidden flex items-center justify-center">×</button>
                                                </div>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {chapter.chapterContent.map((lecture, lecIndex) => (
                                                    <div key={lecture.lectureId || lecture._id || lecIndex} className="px-10 py-10 flex flex-wrap lg:flex-nowrap items-center gap-8 bg-white/50 group">
                                                        <span className="text-[10px] font-black text-gray-300 w-8">{String(lecIndex + 1).padStart(2, '0')}</span>
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[300px]">
                                                            <input
                                                                type="text"
                                                                value={lecture.lectureTitle}
                                                                onChange={(e) => updateLecture(chIndex, lecIndex, 'lectureTitle', e.target.value)}
                                                                className="w-full bg-gray-50/50 p-4 rounded-xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                                placeholder="Knowledge Nexus Title"
                                                            />
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-xl">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => updateLecture(chIndex, lecIndex, 'uploadMode', false)}
                                                                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!lecture.uploadMode ? 'bg-[#0C132B] text-white shadow-lg' : 'text-gray-400 hover:text-indigo-500'}`}
                                                                    >
                                                                        External Link
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => updateLecture(chIndex, lecIndex, 'uploadMode', true)}
                                                                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${lecture.uploadMode ? 'bg-[#0C132B] text-white shadow-lg' : 'text-gray-400 hover:text-indigo-500'}`}
                                                                    >
                                                                        Local Asset
                                                                    </button>
                                                                </div>
                                                                
                                                                {!lecture.uploadMode ? (
                                                                    <input
                                                                        type="text"
                                                                        value={lecture.lectureUrl}
                                                                        onChange={(e) => updateLecture(chIndex, lecIndex, 'lectureUrl', e.target.value)}
                                                                        className="w-full bg-gray-50/50 p-4 rounded-xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                                                                        placeholder="Streaming Repository (YouTube URL)"
                                                                    />
                                                                ) : (
                                                                    <div className="relative group">
                                                                        <input
                                                                            type="file"
                                                                            accept="video/mp4"
                                                                            onChange={(e) => handleVideoUpload(chIndex, lecIndex, e.target.files[0])}
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            disabled={isUploading}
                                                                        />
                                                                        <div className="w-full bg-indigo-50/30 border-2 border-dashed border-indigo-100 p-4 rounded-xl text-center group-hover:border-indigo-300 transition-all">
                                                                            {lecture.lectureUrl ? (
                                                                                <div className="flex items-center justify-center gap-2">
                                                                                    <span className="text-emerald-500">✓</span>
                                                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Asset Ready</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Inject .MP4 Asset</span>
                                                                            )}
                                                                        </div>
                                                                        {uploadProgress[lecture.lectureId] && (
                                                                            <div className="mt-4 px-2">
                                                                                <div className="flex justify-between items-center mb-2">
                                                                                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Transmitting Bytes...</span>
                                                                                    <span className="text-[8px] font-black text-indigo-500">{uploadProgress[lecture.lectureId]}%</span>
                                                                                </div>
                                                                                <Line percent={uploadProgress[lecture.lectureId]} strokeWidth="1" strokeColor="#6366f1" trailColor="#f1f5f9" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <textarea
                                                                value={lecture.lectureDescription || ''}
                                                                onChange={(e) => updateLecture(chIndex, lecIndex, 'lectureDescription', e.target.value)}
                                                                className="md:col-span-2 w-full bg-gray-50/50 p-4 rounded-xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none min-h-[96px]"
                                                                placeholder="AI lesson context and student-facing lecture summary"
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

                                                        {/* Strategic Resources (Attachments) */}
                                                        <div className="w-full mt-6 pt-6 border-t border-gray-100/50">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <FileDown size={14} className="text-indigo-500" />
                                                                    Strategic Assets
                                                                </label>
                                                                <div className="relative">
                                                                    <input 
                                                                        type="file" 
                                                                        onChange={(e) => handleAttachmentUpload(chIndex, lecIndex, e.target.files[0])}
                                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
                                                                        disabled={isUploading}
                                                                    />
                                                                    <button type="button" className="text-[9px] font-black text-indigo-500 border border-indigo-100 px-4 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2">
                                                                        <Plus size={10} />
                                                                        Append Asset
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {lecture.attachments?.map((att, attIdx) => (
                                                                    <div key={attIdx} className="px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center gap-3 transition-all hover:border-indigo-200">
                                                                        <FileText size={12} className="text-gray-400" />
                                                                        <span className="text-[10px] font-bold text-gray-600 truncate max-w-[120px]">{att.fileName}</span>
                                                                        <button type="button" onClick={() => removeAttachment(chIndex, lecIndex, attIdx)} className="text-gray-300 hover:text-rose-500 transition-colors">
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {(!lecture.attachments || lecture.attachments.length === 0) && (
                                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest py-2">No strategic assets deployed for this nexus</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Strategic Assessments (Assignments) */}
                            <div className="mt-16 pt-16 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <ClipboardList size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight">Strategic Assessments</h2>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">High-stakes Assignments</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={addAssignment}
                                        className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-3"
                                    >
                                        <Plus size={16} />
                                        Publish Course
                                    </button>
                                </div>

                                {assignments.length === 0 ? (
                                    <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-100 opacity-50">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No assignments added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {assignments.map((assignment, index) => (
                                            <div key={assignment._id || index} className="bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400">A{index + 1}</span>
                                                        <input
                                                            type="text"
                                                            value={assignment.title}
                                                            onChange={(e) => handleUpdateAssignment(index, 'title', e.target.value)}
                                                            className="flex-1 bg-transparent text-xl font-black text-[#0C132B] outline-none focus:text-indigo-500 transition-colors"
                                                            placeholder="Assessment Designation"
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => removeAssignment(index)} className="w-10 h-10 rounded-xl hover:bg-rose-50 text-rose-400 transition-all flex items-center justify-center">✕</button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assignment Description</label>
                                                        <textarea
                                                            value={assignment.description}
                                                            onChange={(e) => handleUpdateAssignment(index, 'description', e.target.value)}
                                                            className="w-full bg-gray-50/50 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none min-h-[120px] resize-none focus:bg-white transition-all"
                                                            placeholder="Instructions for students..."
                                                        />
                                                    </div>
                                                    <div className="space-y-8">
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deadline Date</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="date"
                                                                    value={assignment.deadline}
                                                                    onChange={(e) => handleUpdateAssignment(index, 'deadline', e.target.value)}
                                                                    className="w-full bg-gray-50/50 p-6 pl-14 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none"
                                                                />
                                                                <Clock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Marks</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={assignment.totalMarks}
                                                                    onChange={(e) => handleUpdateAssignment(index, 'totalMarks', e.target.value)}
                                                                    className="w-full bg-gray-50/50 p-6 pl-14 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none"
                                                                />
                                                                <Award size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-10">
                                <button type="button" onClick={() => setActiveTab('basic')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors">← Back to Basics</button>
                                <button type="button" onClick={() => setActiveTab('certification')} className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-black/10">
                                    Define Credentials →
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'certification' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Certification Blueprint</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${isCertificateEnabled ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 bg-white opacity-50'}`} onClick={() => setIsCertificateEnabled(!isCertificateEnabled)}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">🎖️</div>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${isCertificateEnabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isCertificateEnabled ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-[#0C132B] uppercase tracking-widest mb-2">Enable Certification</h3>
                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Students will receive a digital credential upon successful curriculum mastery.</p>
                                </div>

                                <div className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${isQuizEnabled ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 bg-white opacity-50'}`} onClick={() => isCertificateEnabled && setIsQuizEnabled(!isQuizEnabled)}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">📝</div>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${isQuizEnabled ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isQuizEnabled ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-[#0C132B] uppercase tracking-widest mb-2">Enforce Assessment Gate</h3>
                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Certification is locked until a passing score is achieved in the final quiz.</p>
                                </div>
                            </div>

                            {isCertificateEnabled && (
                                <div className="mt-16 space-y-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Credential Architecture</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {templates.map(temp => (
                                                <div 
                                                    key={temp._id} 
                                                    onClick={() => setSelectedTemplate(temp._id)}
                                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedTemplate === temp._id ? 'border-indigo-500 bg-indigo-50/20 shadow-xl shadow-indigo-500/10' : 'border-gray-50 bg-gray-50/30 opacity-60 hover:opacity-100'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-2xl">📜</span>
                                                        {selectedTemplate === temp._id && <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">✓</span>}
                                                    </div>
                                                    <p className="text-[10px] font-black text-[#0C132B] uppercase tracking-widest truncate">{temp.title}</p>
                                                    {temp.isDefault && <span className="text-[8px] font-black text-amber-500 uppercase mt-1 block">Default Protocol</span>}
                                                </div>
                                            ))}
                                            {templates.length === 0 && (
                                                <div className="col-span-full p-8 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Global Templates Found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issuance Protocol</label>
                                        <div className="flex flex-wrap gap-6">
                                            <button 
                                                type="button" 
                                                onClick={() => setIssueMethod('quiz')}
                                                className={`flex-1 min-w-[200px] p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all ${issueMethod === 'quiz' ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-100 opacity-60'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${issueMethod === 'quiz' ? 'border-indigo-500 bg-white' : 'border-gray-200'}`}>
                                                    {issueMethod === 'quiz' && <div className="w-4 h-4 bg-indigo-500 rounded-full animate-in zoom-in-50 duration-300"></div>}
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-[10px] font-black text-[#0C132B] uppercase tracking-widest mb-1">Assessment Gate</span>
                                                    <span className="block text-[8px] font-bold text-gray-400 uppercase">Requires Quiz Mastery</span>
                                                </div>
                                            </button>

                                            <button 
                                                type="button" 
                                                onClick={() => setIssueMethod('completion')}
                                                className={`flex-1 min-w-[200px] p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all ${issueMethod === 'completion' ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-100 opacity-60'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${issueMethod === 'completion' ? 'border-indigo-500 bg-white' : 'border-gray-200'}`}>
                                                    {issueMethod === 'completion' && <div className="w-4 h-4 bg-indigo-500 rounded-full animate-in zoom-in-50 duration-300"></div>}
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-[10px] font-black text-[#0C132B] uppercase tracking-widest mb-1">Full Curriculum Mastery</span>
                                                    <span className="block text-[8px] font-bold text-gray-400 uppercase">Issues on 100% Completion</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isCertificateEnabled && (
                                <div className="mt-12 p-8 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex gap-4">
                                    <span className="text-xl">⚠️</span>
                                    <p className="text-[10px] text-amber-900 font-bold leading-relaxed">Certification is currently deactivated for this curriculum node. Manual uploads will still be authorized for individual scholars.</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-16">
                                <button type="button" onClick={() => setActiveTab('curriculum')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors">← Back to Curriculum</button>
                                <button type="button" onClick={() => setActiveTab('metadata')} className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-black/10">
                                    Define Economics →
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'metadata' && (
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tight mb-12">Pricing & Discounts</h2>
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
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">By deploying this module, you certify all content adheres to instructional standards.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || isUploading}
                                    className={`bg-[#0C132B] text-white px-16 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-${isEditMode ? 'indigo' : 'emerald'}-500 transition-all shadow-2xl shadow-black/10 disabled:opacity-50 min-w-[280px]`}
                                >
                                    {isUploading ? 'Uploading Assets...' : loading ? 'Saving...' : (isEditMode ? 'Update Course' : 'Publish Course')}
                                </button>

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

export default AddCourse;




