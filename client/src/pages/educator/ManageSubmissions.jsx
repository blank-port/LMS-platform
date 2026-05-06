import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Eye, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    User,
    Calendar,
    Award,
    Download,
    FileText,
    ChevronRight,
    MessageSquare,
    Save
} from 'lucide-react';

const ManageSubmissions = () => {
    const { userData } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' });

    useEffect(() => {
        fetchInstructorCourses();
    }, []);

    const fetchInstructorCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            if (data.success) {
                setCourses(data.courses);
                if (data.courses.length > 0) {
                    setSelectedCourse(data.courses[0]._id);
                    fetchAssignments(data.courses[0]._id);
                }
            }
        } catch (error) {
            toast.error('Failed to load courses');
        }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const { data } = await api.get(`/assignment/course/${courseId}`);
            if (data.success) {
                setAssignments(data.assignments);
                if (data.assignments.length > 0) {
                    setSelectedAssignment(data.assignments[0]._id);
                    fetchSubmissions(data.assignments[0]._id);
                } else {
                    setSubmissions([]);
                    setSelectedAssignment('');
                }
            }
        } catch (error) {
            toast.error('Failed to load assignments');
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/assignment/submissions/${assignmentId}`);
            if (data.success) {
                setSubmissions(data.submissions);
            }
        } catch (error) {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        fetchAssignments(courseId);
    };

    const handleAssignmentChange = (e) => {
        const assignmentId = e.target.value;
        setSelectedAssignment(assignmentId);
        fetchSubmissions(assignmentId);
    };

    const startGrading = (submission) => {
        setGradingSubmission(submission);
        setGradeData({
            marksObtained: submission.marksObtained || '',
            feedback: submission.feedback || ''
        });
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.marksObtained) {
            toast.error('Valuation metrics required');
            return;
        }
        try {
            const { data } = await api.post(`/assignment/grade/${gradingSubmission._id}`, gradeData);
            if (data.success) {
                toast.success('Institutional grading verified');
                setGradingSubmission(null);
                fetchSubmissions(selectedAssignment);
            }
        } catch (error) {
            toast.error('Grading failure');
        }
    };

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Instructor Dashboard</p>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Student Assignments</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Course</label>
                            <select 
                                value={selectedCourse} 
                                onChange={handleCourseChange}
                                className="bg-white border border-gray-100 p-4 rounded-2xl text-[10px] font-black text-[#0C132B] outline-none shadow-sm min-w-[200px]"
                            >
                                {courses.map(course => <option key={course._id} value={course._id}>{course.courseTitle}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Assignment</label>
                            <select 
                                value={selectedAssignment} 
                                onChange={handleAssignmentChange}
                                className="bg-white border border-gray-100 p-4 rounded-2xl text-[10px] font-black text-[#0C132B] outline-none shadow-sm min-w-[200px]"
                            >
                                <option value="">Select Assignment</option>
                                {assignments.map(ass => <option key={ass._id} value={ass._id}>{ass.title}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {!selectedAssignment ? (
                    <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl grayscale opacity-30">📁</div>
                        <h3 className="text-xl font-black text-[#0C132B] tracking-tight mb-2">No Assignment Selected</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select an active assignment to view student submissions</p>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center p-24 py-40">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Synchronizing Records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Submissions List */}
                        <div className="lg:col-span-2 space-y-6">
                            {submissions.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest pt-2">No scholar has committed a response to this assessment yet</p>
                                </div>
                            ) : (
                                submissions.map((sub) => (
                                    <div 
                                        key={sub._id} 
                                        className={`bg-white rounded-[2rem] p-8 border transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] cursor-pointer ${gradingSubmission?._id === sub._id ? 'border-indigo-500 shadow-xl' : 'border-gray-50'}`}
                                        onClick={() => startGrading(sub)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <img 
                                                        src={sub.studentId?.profilePicture || 'https://via.placeholder.com/100'} 
                                                        alt={sub.studentId?.name} 
                                                        className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                                                    />
                                                    {sub.status === 'graded' && (
                                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-lg">
                                                            <CheckCircle size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-black text-[#0C132B] tracking-tight">{sub.studentId?.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{sub.studentId?.email}</span>
                                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(sub.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {sub.status === 'graded' ? (
                                                    <div className="bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100 text-center">
                                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Grade Verified</p>
                                                        <p className="text-lg font-black text-emerald-700">{sub.marksObtained}/{assignments.find(a => a._id === selectedAssignment)?.totalMarks}</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-50 px-6 py-3 rounded-xl border border-amber-100 text-center animate-pulse">
                                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">Pending Review</p>
                                                        <p className="text-sm font-black text-amber-700">WAITING</p>
                                                    </div>
                                                )}
                                                <ChevronRight size={20} className="text-gray-300" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Grading Panel */}
                        <div className="lg:col-span-1">
                            {gradingSubmission ? (
                                <div className="bg-white rounded-[2.5rem] p-10 border border-indigo-100 shadow-[0_40px_80px_rgba(99,102,241,0.05)] sticky top-8 animate-in slide-in-from-right-10 duration-500">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <Eye size={20} />
                                        </div>
                                        <h3 className="text-xl font-black text-[#0C132B] tracking-tight">Grading Details</h3>
                                    </div>

                                    {/* Submission Content */}
                                    <div className="space-y-8 mb-10 pb-10 border-b border-gray-50">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FileText size={14} className="text-indigo-500" />
                                                Scholar Response
                                            </label>
                                            <div className="bg-gray-50/50 p-6 rounded-2xl">
                                                <p className="text-xs font-bold text-[#0C132B] leading-relaxed whitespace-pre-wrap">{gradingSubmission.content}</p>
                                            </div>
                                        </div>

                                        {gradingSubmission.attachments?.length > 0 && (
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Download size={14} className="text-indigo-500" />
                                                    Strategic Assets ({gradingSubmission.attachments.length})
                                                </label>
                                                <div className="grid gap-2">
                                                    {gradingSubmission.attachments.map((att, idx) => (
                                                        <a 
                                                            key={idx} 
                                                            href={att.fileUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <FileText size={14} className="text-gray-400 group-hover:text-indigo-500" />
                                                                <span className="text-[10px] font-black text-gray-600 truncate max-w-[150px]">{att.fileName}</span>
                                                            </div>
                                                            <Download size={14} className="text-gray-300 group-hover:text-indigo-500" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Grading Form */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Marks Obtained</label>
                                                <span className="text-[9px] font-black text-gray-400 uppercase">Max: {assignments.find(a => a._id === selectedAssignment)?.totalMarks}</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={gradeData.marksObtained}
                                                    onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                                                    className="w-full bg-gray-50/50 border border-gray-100 p-6 pl-14 rounded-2xl font-black text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-xl"
                                                    placeholder="00"
                                                />
                                                <Award size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Instructional Feedback</label>
                                            <div className="relative">
                                                <textarea
                                                    value={gradeData.feedback}
                                                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                    className="w-full bg-gray-50/50 border border-gray-100 p-6 pl-14 rounded-2xl text-[11px] font-bold text-[#0C132B] outline-none focus:bg-white transition-all min-h-[140px] resize-none"
                                                    placeholder="Provide professional insight..."
                                                />
                                                <MessageSquare size={18} className="absolute left-6 top-7 text-gray-300" />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleGradeSubmit}
                                            className="w-full bg-[#0C132B] text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-black/10 flex items-center justify-center gap-3"
                                        >
                                            <Save size={16} />
                                            Submit Grade
                                        </button>

                                        <button 
                                            onClick={() => setGradingSubmission(null)}
                                            className="w-full py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors"
                                        >
                                            Dismiss Review
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-indigo-50/30 rounded-[2.5rem] p-12 border border-indigo-100/50 border-dashed text-center h-[600px] flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 text-indigo-500">
                                        <Eye size={32} />
                                    </div>
                                    <h4 className="text-base font-black text-indigo-900 tracking-tight mb-2">Submission Details</h4>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-relaxed">Select a student submission from the left to begin grading.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageSubmissions;


