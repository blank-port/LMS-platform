import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { BookOpen, GraduationCap, ChevronRight } from 'lucide-react';

const MyEnrollments = () => {
    const { user, enrolledCourses, navigate, token, fetchUserEnrolledCourses } = useContext(AppContext);

    useEffect(() => {
        if (token) {
            fetchUserEnrolledCourses();
        }
        window.scrollTo(0, 0);
    }, []);

    if (!user) return null;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Parchments</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Access your authorized learning trajectories</p>
                </div>
                <button 
                    onClick={() => navigate('/course-list')}
                    className="bg-[#0C132B] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10"
                >
                    Expand Knowledge Base
                </button>
            </div>

            <main className="relative z-20 pb-12">
                {enrolledCourses.length === 0 ? (
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 p-24 text-center border border-gray-50 flex flex-col items-center">
                        <div className="text-7xl mb-10 opacity-20 grayscale">📚</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Your bookshelf is empty</h3>
                        <p className="text-gray-400 font-medium mb-12 max-w-sm mx-auto">Start your learning journey by enrolling in our world-class courses designed for future leaders.</p>
                        <button onClick={() => navigate('/course-list')} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
                            Browse Collection
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol ID</th>
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Knowledge Stream</th>
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Mastery Progress</th>
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell text-center">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {enrolledCourses.map((enrollment, index) => {
                                        const course = enrollment.courseId;
                                        if (!course) return null;
                                        return (
                                            <tr key={index} className="group hover:bg-gray-50/50 transition-all duration-300">
                                                <td className="px-10 py-10">
                                                    <span className="text-xs font-black text-gray-400 group-hover:text-indigo-500 transition-colors tracking-widest">
                                                        #{String(index + 1).padStart(3, '0')}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-24 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-500 bg-gray-50">
                                                            <img src={course.courseThumbnail || assets.placeholder} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-base font-black text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-indigo-500 transition-colors line-clamp-1">{course.courseTitle}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1 h-1 bg-indigo-200 rounded-full"></span>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{course.instructor?.name || 'Expert Analyst'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-10 hidden md:table-cell">
                                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 p-0 border border-transparent overflow-hidden">
                                                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tight">{enrollment.progress || 0}% SYNCHRONIZED</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-10 hidden md:table-cell text-center">
                                                    <span className={`inline-flex items-center px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${enrollment.completed
                                                        ? 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                        : enrollment.progress > 0 ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                                                        {enrollment.completed ? 'Mastered' : enrollment.progress > 0 ? 'Active Flow' : 'On-Hold'}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-10 text-right">
                                                    <button
                                                        onClick={() => navigate(`/player/${course._id}`)}
                                                        className="bg-[#0C132B] text-white w-12 h-12 rounded-2xl inline-flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-black/10 group-hover:shadow-indigo-500/20"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyEnrollments;
