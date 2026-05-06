import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { FileText, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';

const Assignments = () => {
    const { backendUrl, token, enrolledCourses } = useContext(AppContext);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);

    useEffect(() => {
        if (token) {
            fetchAllData();
        }
    }, [token, enrolledCourses]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch assignments for all enrolled courses
            const assignmentPromises = enrolledCourses.map(e => 
                api.get(`/assignment/course/${e.courseId._id}`)
            );
            const responses = await Promise.all(assignmentPromises);
            const allAssignments = responses.flatMap(r => r.data.assignments);
            setAssignments(allAssignments);

            // Fetch submissions
            const { data } = await api.get('/assignment/my-submissions');
            if (data.success) {
                const subMap = {};
                data.submissions.forEach(s => {
                    subMap[s.assignmentId._id] = s;
                });
                setSubmissions(subMap);
            }
        } catch (error) {
            toast.error('Failed to load assignments');
        }
        setLoading(false);
    };

    const handleUpload = async (assignmentId, files) => {
        if (!files || files.length === 0) return;
        
        setSubmitting(assignmentId);
        const formData = new FormData();
        formData.append('assignmentId', assignmentId);
        for (let i = 0; i < files.length; i++) {
            formData.append('attachments', files[i]);
        }

        try {
            const { data } = await api.post('/assignment/submit', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                toast.success('Assignment submitted!');
                fetchAllData();
            }
        } catch (error) {
            toast.error('Submission failed');
        }
        setSubmitting(null);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Collecting Tasks...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Tasks</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your course assignments and deadlines</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {assignments.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-[3rem] p-24 text-center border border-dashed border-gray-200">
                        <FileText size={48} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-900 mb-2">No pending tasks</h3>
                        <p className="text-gray-400 text-xs font-medium">Your instructors haven't assigned any work for your enrolled courses yet.</p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const submission = submissions[assignment._id];
                        const isOverdue = new Date(assignment.deadline) < new Date() && !submission;

                        return (
                            <div key={assignment._id} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/40 border border-gray-50 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
                                        <FileText size={24} />
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        submission 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {submission ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">{assignment.title}</h3>
                                <p className="text-gray-500 text-sm mb-8 line-clamp-2">{assignment.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Clock size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {new Date(assignment.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-indigo-500 justify-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Score: {assignment.totalMarks}</span>
                                    </div>
                                </div>

                                {submission ? (
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Submission Status</span>
                                            <span className={`text-[10px] font-black uppercase ${submission.status === 'graded' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                        {submission.status === 'graded' && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-gray-900">Score Achieved:</span>
                                                    <span className="text-lg font-black text-indigo-600">{submission.marksObtained} / {assignment.totalMarks}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 italic">" {submission.feedback} "</p>
                                            </div>
                                        )}
                                        {submission.status === 'submitted' && (
                                            <p className="text-[10px] text-gray-400 font-medium">Awaiting instructor evaluation.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${
                                            submitting === assignment._id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50/30 hover:border-indigo-200 border-gray-100'
                                        }`}>
                                            <Upload className="text-gray-300 mb-2" size={20} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {submitting === assignment._id ? 'Uploading...' : 'Transmit Submission'}
                                            </span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                multiple 
                                                disabled={submitting === assignment._id}
                                                onChange={(e) => handleUpload(assignment._id, e.target.files)} 
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Assignments;




