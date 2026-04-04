import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewEnrollment = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ userId: '', courseId: '', enrollmentDate: new Date().toISOString().split('T')[0] });

    const fetchData = async () => {
        try {
            const userRes = await axios.get(`${backendUrl}/api/admin/users`, getHeaders());
            const courseRes = await axios.get(`${backendUrl}/api/course/list`, getHeaders());
            if (userRes.data.success) setUsers(userRes.data.users.filter(u => u.role === 'student'));
            if (courseRes.data.success) setCourses(courseRes.data.courses);
        } catch (error) {
            toast.error('Strategic Asset Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Initializing Manual Enrollment Protocol...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/enroll-student`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Scholar inducted into curriculum sector.', type: "success", isLoading: false, autoClose: 3000 });
                setFormData({ userId: '', courseId: '', enrollmentDate: new Date().toISOString().split('T')[0] });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Enrollment protocol failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Admission Nodes...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Manual Enrollment Protocol</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Administrative Override & Strategic Scholar Induction</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-9xl font-black italic pointer-events-none">JOIN</div>

                <form onSubmit={handleEnroll} className="space-y-10 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Scholar Identity</label>
                            <select className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[11px] uppercase tracking-widest" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} required>
                                <option value="">Select Target Scholar</option>
                                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Curriculum Sector</label>
                            <select className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[11px] uppercase tracking-widest" value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })} required>
                                <option value="">Select Curriculum Node</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 max-w-sm">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Initialization Date</label>
                        <input type="date" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={formData.enrollmentDate} onChange={e => setFormData({ ...formData, enrollmentDate: e.target.value })} required />
                    </div>

                    <div className="pt-8">
                        <button type="submit" className="w-full h-20 bg-gray-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-blue-600 shadow-2xl shadow-black/10 transition-all flex items-center justify-center gap-4 group">
                            Initialize Manual Induction
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100/50">
                <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest text-center leading-relaxed">
                    Warning: Manual induction bypasses standard fiscal protocols. All administrative overrides are logged in the systemic audit trail.
                </p>
            </div>
        </div>
    );
};

export default NewEnrollment;
