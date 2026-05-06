import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/utils/api';
import { ArrowLeft, Users, CheckCircle2, XCircle, Clock, Calendar, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const EducatorAttendance = () => {
    const { sessionId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, [sessionId]);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get(`/cohort/session-attendance/${sessionId}`);
            if (data.success) {
                setData(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to decrypt attendance intelligence");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Participation Matrix...</p>
        </div>
    );

    if (!data) return (
        <div className="text-center py-20">
            <p className="text-slate-400 font-black uppercase tracking-widest">Attendance Artifacts Unavailable</p>
            <Link to="/educator/live-sessions" className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-bold uppercase text-[10px] tracking-widest">
                <ArrowLeft size={14} /> Back to Broadcasts
            </Link>
        </div>
    );

    const { session, stats } = data;
    
    // Map full student list to include their attendance status
    const studentsWithStatus = stats.fullStudentList.map(student => {
        const attendanceRecord = stats.markedList.find(a => a.studentId?._id === student._id);
        return {
            ...student,
            isPresent: !!attendanceRecord,
            joinedAt: attendanceRecord?.joinedAt
        };
    });

    const filteredStudents = studentsWithStatus.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <Link to="/educator/live-sessions" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Back to Broadcast Registry</p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Participation Intelligence</h1>
                </div>
            </div>

            {/* Session Info Bar */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/40 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
                        <Users size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{session.title}</h2>
                        <div className="flex items-center gap-4 mt-1 opacity-60">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Calendar size={12} /> {new Date(session.startTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Clock size={12} /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="text-center bg-emerald-50 px-8 py-4 rounded-2xl border border-emerald-100 flex-1 min-w-[120px]">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present</p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">{stats.present}</p>
                    </div>
                    <div className="text-center bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 flex-1 min-w-[120px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent</p>
                        <p className="text-2xl font-black text-slate-300 tracking-tighter">{stats.total - stats.present}</p>
                    </div>
                    <div className="text-center bg-indigo-50 px-8 py-4 rounded-2xl border border-indigo-100 flex-1 min-w-[120px]">
                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Engagement</p>
                        <p className="text-2xl font-black text-indigo-600 tracking-tighter">
                            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                        </p>
                    </div>
                </div>

            </div>

            {/* List Header & Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    Verified Scholars <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500">{filteredStudents.length}</span>
                </h3>
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search Identity..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-slate-100 focus:border-emerald-500 rounded-full pl-14 pr-8 py-3 text-xs font-bold outline-none transition-all w-[300px] shadow-sm"
                    />
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredStudents.map((scholar, i) => (
                            <tr key={scholar._id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 border border-slate-100 overflow-hidden">
                                            {scholar.avatar ? (
                                                <img src={scholar.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                                                    {scholar.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tighter uppercase">{scholar.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{scholar.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    {scholar.isPresent ? (
                                        <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                            <CheckCircle2 size={12} /> Present
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 text-slate-300 bg-slate-50 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                            <XCircle size={12} /> Absent
                                        </div>
                                    )}
                                </td>
                                <td className="px-10 py-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {scholar.joinedAt ? new Date(scholar.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-slate-300 text-xs font-black uppercase tracking-widest">No matching scholars in this sector</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EducatorAttendance;


