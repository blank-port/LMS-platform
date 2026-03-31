import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstructorQuizReports = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

    const fetchInstructorCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/courses`, getHeaders());
            if (data.success) {
                setCourses(data.courses);
                if (data.courses.length > 0) setSelectedCourse(data.courses[0]._id);
            }
        } catch (error) {
            toast.error('Performance Data unavailable');
        }
    };

    const fetchReports = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/quiz/reports/unified`, getHeaders());
            if (data.success) {
                setReports(data.reports.map(report => ({
                    studentName: report.userId.name,
                    email: report.userId.email,
                    quizTitle: report.quizId.title,
                    score: report.percentage,
                    status: report.isPassed ? 'Passed' : 'Failed',
                    date: new Date(report.createdAt).toLocaleDateString()
                })));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInstructorCourses(); }, []);
    useEffect(() => { fetchReports(); }, [selectedCourse]);

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Performance Analytics</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Assessment Reports</h1>
                </div>

                <div className="flex flex-wrap gap-4 bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50">
                    <div className="px-6 border-r border-gray-100 last:border-0 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Average Mastery</p>
                        <p className="text-2xl font-black text-indigo-500 tracking-tighter">82%</p>
                    </div>
                    <div className="px-6 border-r border-gray-100 last:border-0 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Attempts</p>
                        <p className="text-2xl font-black text-[#0C132B] tracking-tighter">{reports.length}</p>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <div className="relative w-full max-w-sm group">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full bg-white border border-gray-100 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#0C132B] outline-none shadow-sm hover:shadow-md transition-all appearance-none pr-12"
                    >
                        {courses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
                    </select>
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none opacity-40 group-hover:text-indigo-500 transition-colors">▼</span>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Intelligence Unit</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Mastery Score</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Synchronization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-24 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] animate-pulse">Analyzing Repositories...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="5" className="p-24 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No performance record found</td></tr>
                            ) : reports.map((r, i) => (
                                <tr key={i} className="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-[#0C132B] tracking-tight group-hover:text-indigo-500 transition-colors">{r.studentName}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{r.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-gray-600 tracking-tight">{r.quizTitle}</p>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`text-2xl font-black tracking-tighter ${r.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{r.score}%</span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{r.date}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorQuizReports;
