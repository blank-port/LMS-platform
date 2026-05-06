import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import ManualCertificateModal from '../../components/educator/ManualCertificateModal.jsx';
import { Award, Mail, ChevronRight, Search, LayoutGrid, List } from 'lucide-react';

const StudentsEnrolled = () => {
    const { navigate } = useContext(AppContext);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedCourseTitle, setSelectedCourseTitle] = useState('');

    useEffect(() => { 
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            if (data.success) setCourses(data.courses);
        } catch (error) { console.error(error); }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/instructor/enrolled-students');
            if (data.success) setStudents(data.enrolledStudents);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const openIssueModal = (student, courseId, courseTitle) => {
        setSelectedStudent(student);
        setSelectedCourseId(courseId);
        setSelectedCourseTitle(courseTitle);
        setIsModalOpen(true);
    };

    const filteredStudents = selectedCourse === 'all' 
        ? students 
        : students.filter(s => s.courseId === selectedCourse);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-vh-[400px]">
            <div className="w-12 h-12 border-4 border-[#0C132B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Learner Data...</p>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Knowledge Engagement</p>
                    </div>
                    <h1 className="text-4xl font-black text-[#0C132B] tracking-tighter">Scholar Network</h1>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                    >
                        <option value="all">All Modules</option>
                        {courses.map(c => (
                            <option key={c._id} value={c._id}>{c.courseTitle}</option>
                        ))}
                    </select>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{filteredStudents.length} Active Profiles</span>
                    </div>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 p-24 text-center border border-gray-50 max-w-4xl mx-auto mt-12">
                    <div className="text-7xl mb-10 opacity-20 grayscale">👨‍🎓</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">The Academy is Quiet</h3>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-relaxed">No scholars have initialized their journey through your modules yet. Deploy more content to attract intelligence.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Identity</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Module</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell text-center">Mastery Progress</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Contact</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.map((item, index) => (
                                    <tr key={index} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <span className="text-[10px] font-black text-gray-300 group-hover:text-[#0C132B] transition-colors">{String(index + 1).padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-[#0C132B] text-white rounded-[1rem] flex items-center justify-center text-xs font-black shadow-lg shadow-[#0C132B]/10 group-hover:scale-110 transition-transform">
                                                    {item.student?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-[#0C132B] tracking-tight group-hover:text-indigo-500 transition-colors">{item.student?.name}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.student?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-black text-gray-600 tracking-tight line-clamp-1 truncate max-w-[250px]">{item.courseTitle}</p>
                                        </td>
                                        <td className="px-10 py-8 hidden md:table-cell">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-[#0C132B] h-full rounded-full transition-all duration-1000" style={{ width: `${item.progress || 0}%` }}></div>
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.progress || 0}% SYNCED</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => navigate('/educator/communication?view=messages&student=' + item.student?._id)}
                                                    className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-[#0C132B] hover:text-white transition-all shadow-sm"
                                                    title="Send Signal"
                                                >
                                                    💬
                                                </button>
                                                <a 
                                                    href={`mailto:${item.student?.email}`}
                                                    className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-[#0C132B] hover:text-white transition-all shadow-sm"
                                                    title="Email Institutional Lead"
                                                >
                                                    <Mail size={16} />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button 
                                                onClick={() => openIssueModal(item.student, item.courseId, item.courseTitle)}
                                                className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center gap-2 ml-auto"
                                            >
                                                <Award size={14} /> Certificate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Injection */}
            {selectedStudent && (
                <ManualCertificateModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                    courseId={selectedCourseId}
                    courseTitle={selectedCourseTitle}
                />
            )}
        </div>
    );
};

export default StudentsEnrolled;




