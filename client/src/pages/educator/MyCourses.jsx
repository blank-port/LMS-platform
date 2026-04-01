import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setCourses(data.courses);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#0C132B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Retrieving Catalogue...</p>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-[#0C132B] rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Module Inventory</p>
                    </div>
                    <h1 className="text-4xl font-black text-[#0C132B] tracking-tighter">My Courses</h1>
                </div>
                <button
                    onClick={() => navigate('/educator/add-course')}
                    className="bg-[#0C132B] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-black/10 flex items-center gap-3"
                >
                    <span>Create New module</span>
                    <span className="text-base">+</span>
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 p-24 text-center border border-gray-50 max-w-4xl mx-auto mt-12">
                    <div className="text-7xl mb-10 opacity-20 grayscale">📚</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Vast potential, zero content</h3>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-relaxed mb-10">Your instructional legacy begins with a single module. Deploy your first course to the PrisMed ecosystem.</p>
                    <button
                        onClick={() => navigate('/educator/add-course')}
                        className="bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0C132B] transition-all shadow-xl shadow-indigo-500/20"
                    >
                        Initialize First Module
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Module Specifications</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Intellectual Domain</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell text-center">Engagement</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Intelligence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 transition-all">
                                {courses.map((course, index) => (
                                    <tr key={course._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <span className="text-[10px] font-black text-gray-300 group-hover:text-[#0C132B] transition-colors">{String(index + 1).padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="relative flex-shrink-0">
                                                    <img src={course.courseThumbnail || 'https://placehold.co/120x80'} alt="" className="w-24 h-16 rounded-xl object-cover shadow-lg shadow-black/5" />
                                                    <div className="absolute inset-0 bg-black/5 rounded-xl border border-white/10"></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[#0C132B] tracking-tight group-hover:text-indigo-500 transition-colors line-clamp-1">{course.courseTitle}</p>
                                                    <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{course.courseContent?.length || 0} Assets</span>
                                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Lvl {course.courseLevel || 'All'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 hidden lg:table-cell">
                                            <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-600 uppercase tracking-widest">{course.category?.name || 'Uncategorized'}</span>
                                        </td>
                                        <td className="px-10 py-8 hidden md:table-cell text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="text-base font-black text-[#0C132B]">{course.enrolledStudents?.length || 0}</p>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Scholars</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border ${course.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        course.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                                <button
                                                    onClick={() => navigate(`/educator/edit-course/${course._id}`)}
                                                    className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#0C132B] hover:bg-[#0C132B] hover:text-white hover:shadow-xl transition-all group/btn"
                                                >
                                                    <span className="group-hover/btn:scale-110 transition-transform">⚙️</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
