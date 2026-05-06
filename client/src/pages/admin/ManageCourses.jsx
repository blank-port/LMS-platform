import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ManageCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category');

    useEffect(() => { 
        fetchCourses(categoryId); 
    }, [categoryId]);

    const fetchCourses = async (categoryFilter) => {
        setLoading(true);
        try {
            const url = categoryFilter 
                ? `/admin/courses?category=${categoryFilter}`
                : '/admin/courses';
            
            const { data } = await api.get(url);
            if (data.success) {
                setCourses(data.courses || []);
            }
        } catch (error) { console.error('Fetch Error:', error); }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        const loadingToast = toast.loading(`Synchronizing Asset Status: ${status}...`);
        try {
            const { data } = await api.put(`/admin/courses/${id}/status`, { status });
            if (data.success) { 
                toast.update(loadingToast, { render: `Asset ${status} successfully.`, type: "success", isLoading: false, autoClose: 3000 });
                fetchCourses(categoryId); 
            }
        } catch (error) { 
            toast.update(loadingToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const deleteCourse = async (id) => {
        if (!confirm('Proceed with permanent asset deletion? This action is irreversible.')) return;
        try {
            const { data } = await api.delete(`/admin/courses/${id}`);
            if (data.success) { toast.success('Asset purged from repository.'); fetchCourses(categoryId); }
        } catch (error) { toast.error('Purge failed.'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Optimizing Repository...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Strategic Asset Oversight</h1>
                    {categoryId ? (
                        <div className="flex items-center gap-3 mt-3">
                            <p className="text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em] bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-800/30 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse"></span>
                                Filter Applied: {courses.length > 0 ? courses[0].category?.name : 'Active Profile'}
                            </p>
                            <button 
                                onClick={() => navigate('/admin/courses')}
                                className="text-gray-400 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-colors"
                            >
                                [ Clear Filter ]
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Intellectual Property & Course Governance</p>
                    )}
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descriptor</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Originator</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Classification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {courses.map((course) => (
                                <tr key={course._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="relative overflow-hidden rounded-2xl w-24 h-16 shrink-0 shadow-sm border border-[var(--border)]">
                                                <img src={course.courseThumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)] tracking-tight leading-snug line-clamp-1">{course.courseTitle}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider italic">Asset ID: {course._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 hidden lg:table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--background)] flex items-center justify-center text-[10px] font-black text-gray-500">
                                                {course.instructor?.name?.charAt(0)}
                                            </div>
                                            <p className="text-xs font-bold text-[var(--text-muted)]">{course.instructor?.name || 'Unknown'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 hidden md:table-cell">
                                        <span className="text-[10px] font-black text-gray-500 bg-[var(--background)] px-3 py-1.5 rounded-lg uppercase tracking-wider">{course.category?.name || 'General'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                                            course.status === 'approved' ? 'bg-green-900/20 text-green-400' :
                                            course.status === 'rejected' ? 'bg-red-900/20 text-red-400' :
                                            'bg-amber-900/20 text-amber-400 border border-amber-800/30/50'}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {course.status !== 'approved' && (
                                                <button onClick={() => updateStatus(course._id, 'approved')} className="h-9 px-4 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-sm">Authorize</button>
                                            )}
                                            {course.status !== 'rejected' && (
                                                <button onClick={() => updateStatus(course._id, 'rejected')} className="h-9 px-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all shadow-sm">Terminate</button>
                                            )}
                                            <button onClick={() => navigate(`/admin/edit-course/${course._id}`)} className="h-9 px-4 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[var(--background)] transition-all shadow-sm">Calibrate</button>
                                            <button onClick={() => deleteCourse(course._id)} className="w-9 h-9 flex items-center justify-center bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {courses.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl opacity-20">📚</span>
                        </div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Repository Empty</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No intellectual assets detected in the catalog.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCourses;





