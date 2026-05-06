import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { Users, Calendar, Plus, ExternalLink, Activity, Target, Clock, Video, UserPlus, X, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const ManageCohorts = () => {
    const { navigate } = useContext(AppContext);
    const [cohorts, setCohorts] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'cohort' | 'session' | 'students' | 'announcement'
    const [selectedCohort, setSelectedCohort] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // New Cohort Form
    const [formData, setFormData] = useState({
        courseId: '',
        cohortName: '',
        startDate: '',
        endDate: '',
        batchImage: ''
    });

    // New Session Form
    const [sessionData, setSessionData] = useState({
        title: '',
        description: '',
        startTime: '',
        duration: 60,
        provider: 'livekit',
        meetingLink: '',
        sessionStatus: 'scheduled',
        recordingUrl: ''
    });

    const [announcementData, setAnnouncementData] = useState({
        title: '',
        content: '',
        recipients: 'cohort',
        priority: 'normal'
    });

    // Student Management
    const [courseStudents, setCourseStudents] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [cohortRes, courseRes] = await Promise.all([
                api.get('/cohort/instructor-list'),
                api.get('/instructor/courses')
            ]);
            if (cohortRes.data.success) setCohorts(cohortRes.data.cohorts);
            if (courseRes.data.success) setCourses(courseRes.data.courses);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCohort = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const { data } = await api.put(`/cohort/update/${selectedCohort._id}`, formData);
                if (data.success) {
                    toast.success("Batch Matrix Recalibrated");
                    setIsEditing(false);
                    setSelectedCohort(null);
                }
            } else {
                const { data } = await api.post('/cohort/create', formData);
                if (data.success) toast.success("Batch Matrix Synchronized");
            }
            setActiveModal(null);
            setFormData({ courseId: '', cohortName: '', startDate: '', endDate: '', batchImage: '' });
            fetchInitialData();
        } catch (error) {
            toast.error(isEditing ? "Recalibration Failed" : "Synchronization Failed");
        }
    };

    const handleDeleteCohort = async (id) => {
        if (!window.confirm("Confirm decommissioning of this batch matrix? All live sessions will be purged.")) return;
        try {
            const { data } = await api.delete(`/cohort/delete/${id}`);
            if (data.success) {
                toast.success("Batch Decommissioned");
                fetchInitialData();
            }
        } catch (error) {
            toast.error("Decommissioning Failed");
        }
    };

    const handleSendAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/comm/notice', {
                ...announcementData,
                cohortId: selectedCohort._id
            });
            if (data.success) {
                toast.success("Notice Signal Dispatched");
                setActiveModal(null);
                setAnnouncementData({ title: '', content: '', recipients: 'cohort', priority: 'normal' });
            }
        } catch (error) {
            toast.error("Signal Broadcast Failed");
        }
    };

    const handleScheduleSession = async (e) => {
        e.preventDefault();
        try {
            if (sessionData._id) {
                const { data } = await api.put(`/cohort/update-session/${sessionData._id}`, sessionData);
                if (data.success) toast.success("Live Broadcast Lifecycle Updated");
            } else {
                const { data } = await api.post('/cohort/schedule-session', {
                    ...sessionData,
                    cohortId: selectedCohort._id
                });
                if (data.success) toast.success("Live Broadcast Scheduled");
            }
            setActiveModal(null);
            setSessionData({ title: '', description: '', startTime: '', duration: 60, provider: 'livekit', meetingLink: '', sessionStatus: 'scheduled', recordingUrl: '' });
            fetchInitialData();
        } catch (error) {
            toast.error(sessionData._id ? "Update Failed" : "Scheduling Failed");
        }
    };

    const openStudentManagement = async (cohort) => {
        setSelectedCohort(cohort);
        setActiveModal('students');
        setAssignLoading(true);
        try {
            const { data } = await api.get(`/cohort/course-students/${cohort.courseId._id}`);
            if (data.success) setCourseStudents(data.students);
        } catch (error) {
            toast.error("Failed to fetch candidate scholars");
        } finally {
            setAssignLoading(false);
        }
    };

    const toggleStudentInCohort = async (studentId, isEnrolled) => {
        try {
            const endpoint = isEnrolled ? '/cohort/remove-student' : '/cohort/assign-student';
            const { data } = await api.post(endpoint, {
                cohortId: selectedCohort._id,
                studentId
            });
            if (data.success) {
                toast.success(isEnrolled ? "Scholar Removed" : "Scholar Assigned");
                const updatedCohorts = cohorts.map(c => 
                    c._id === selectedCohort._id ? data.cohort : c
                );
                setCohorts(updatedCohorts);
                setSelectedCohort(data.cohort);
            }
        } catch (error) {
            toast.error("Operation Failed");
        }
    };
    const openEditCohort = (cohort) => {
        setSelectedCohort(cohort);
        setFormData({
            courseId: cohort.courseId?._id || cohort.courseId,
            cohortName: cohort.cohortName,
            startDate: cohort.startDate.split('T')[0],
            endDate: cohort.endDate.split('T')[0],
            batchImage: cohort.batchImage || ''
        });
        setIsEditing(true);
        setActiveModal('cohort');
    };
    return (
        <div className="max-w-[1600px] mx-auto space-y-12 instructor-theme pb-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-10">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Batch Control</h1>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] opacity-80">Synchronized Learning Units & Cohort Orchestration</p>
                </div>
                <button 
                    onClick={() => setActiveModal('cohort')}
                    className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3"
                >
                    <Plus size={16} />
                    <span>Initialize Batch</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {cohorts.length === 0 ? (
                    <div className="lg:col-span-3 py-20 text-center bg-white rounded-[4rem] border border-dashed border-slate-200">
                         <Users size={48} className="mx-auto text-slate-200 mb-6" />
                         <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-none">No active cohorts detected in the synchronized matrix</p>
                    </div>
                ) : (
                    cohorts.map((cohort, i) => (
                        <div key={i} className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 hover:-translate-y-2 transition-all group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                                    <Users size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEditCohort(cohort)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Activity size={16} /></button>
                                    <button onClick={() => handleDeleteCohort(cohort._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                        cohort.status === 'ongoing' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {cohort.status}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">{cohort.cohortName}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 line-clamp-1">{cohort.courseId?.courseTitle}</p>
                            
                            <div className="space-y-4 mb-10">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Commencement</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900">{new Date(cohort.startDate).toLocaleDateString()}</span>
                                </div>
                                <div onClick={() => openStudentManagement(cohort)} className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <Activity size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-700 uppercase">Scholars Assigned</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-emerald-800">{cohort.students?.length || 0}</span>
                                        <UserPlus size={14} className="text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button 
                                    onClick={() => { setSelectedCohort(cohort); setActiveModal('session'); }}
                                    className="h-16 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Target size={14} />
                                    <span>Schedule Live</span>
                                </button>
                                <button 
                                    onClick={() => { setSelectedCohort(cohort); setActiveModal('announcement'); }}
                                    className="h-16 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={14} />
                                    <span>Signal Blast</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate(`/student/cohort/${cohort._id}`)}
                                className="w-full h-14 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Hub Command</span>
                                <ExternalLink size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Layer */}
            {activeModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 overflow-y-auto">
                    
                    {/* 1. Cohort Creation Modal */}
                    {activeModal === 'cohort' && (
                        <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden p-12 relative">
                            <button onClick={() => setActiveModal(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-2"><X size={24} /></button>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-12">{isEditing ? 'Recalibrate Batch Matrix' : 'Initialize Batch Matrix'}</h2>
                            <form onSubmit={handleCreateCohort} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Module Asset</label>
                                    <select 
                                        required
                                        className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold transition-all outline-none"
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                                    >
                                        <option value="">Select Curriculum Unit</option>
                                        {courses.map(course => <option key={course._id} value={course._id}>{course.courseTitle}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Batch Identity Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. REACT-MASTERCLASS-Q4"
                                        className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold transition-all outline-none"
                                        value={formData.cohortName}
                                        onChange={(e) => setFormData({...formData, cohortName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Start Epoch</label>
                                        <input required type="date" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}/>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Terminal Epoch</label>
                                        <input required type="date" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-8 text-sm font-bold outline-none" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}/>
                                    </div>
                                </div>
                                <button className="w-full h-20 bg-emerald-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all">{isEditing ? 'Execute Recalibration' : 'Synchronize Matrix'}</button>
                            </form>
                        </div>
                    )}

                    {/* 2. Live Session Modal */}
                    {activeModal === 'session' && (
                        <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden p-12 relative animate-in fade-in zoom-in duration-300">
                             <button onClick={() => setActiveModal(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-2"><X size={24} /></button>
                             <div className="flex items-center gap-6 mb-12">
                                 <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><Video size={28} /></div>
                                 <div>
                                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Schedule Live Broadcast</h2>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedCohort?.cohortName}</p>
                                 </div>
                             </div>
                              <form onSubmit={handleScheduleSession} className="space-y-8">
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Broadcast Title</label>
                                      <input required type="text" placeholder="e.g. Logic Q&A Workshop" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none" value={sessionData.title} onChange={(e) => setSessionData({...sessionData, title: e.target.value})}/>
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Classroom Provider</label>
                                      <select className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none" value={sessionData.provider} onChange={(e) => setSessionData({...sessionData, provider: e.target.value})}>
                                          <option value="livekit">LiveKit Classroom</option>
                                          <option value="external">External Meeting Link</option>
                                      </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-8">
                                      <div className="space-y-3">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Commencement Time</label>
                                          <input required type="datetime-local" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none" value={sessionData.startTime} onChange={(e) => setSessionData({...sessionData, startTime: e.target.value})}/>
                                      </div>
                                      <div className="space-y-3">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Duration (Minutes)</label>
                                          <input required type="number" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none" value={sessionData.duration} onChange={(e) => setSessionData({...sessionData, duration: e.target.value})}/>
                                      </div>
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Broadcast Stream Link</label>
                                      <input type="url" placeholder={sessionData.provider === 'livekit' ? 'Optional external fallback link' : 'Zoom / YouTube / Meet Link'} className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none" value={sessionData.meetingLink} onChange={(e) => setSessionData({...sessionData, meetingLink: e.target.value})}/>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-8">
                                      <div className="space-y-3">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Session Status</label>
                                          <select 
                                              className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none"
                                              value={sessionData.sessionStatus}
                                              onChange={(e) => setSessionData({...sessionData, sessionStatus: e.target.value})}
                                          >
                                              <option value="scheduled">Scheduled</option>
                                              <option value="live">Live Now</option>
                                              <option value="ended">Completed/Archive</option>
                                              <option value="cancelled">Cancelled</option>
                                          </select>
                                      </div>
                                      <div className="space-y-3">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">External Recording URL (Past Sessions)</label>
                                          <input type="url" placeholder="Cloudinary/Vimeo/Zoom Link" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-8 text-sm font-bold outline-none" value={sessionData.recordingUrl} onChange={(e) => setSessionData({...sessionData, recordingUrl: e.target.value})}/>
                                      </div>
                                  </div>
                                  
                                  <button className="w-full h-20 bg-rose-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                                      {sessionData._id ? 'Update Session Lifecycle' : 'Command Broadcast'}
                                  </button>
                              </form>
                        </div>
                    )}

                    {/* 3. Student Management Modal */}
                    {activeModal === 'students' && (
                        <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden p-12 relative animate-in slide-in-from-bottom-10 duration-500">
                             <button onClick={() => setActiveModal(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-2"><X size={24} /></button>
                             <div className="flex items-center justify-between mb-12">
                                 <div className="flex items-center gap-6">
                                     <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><UserPlus size={28} /></div>
                                     <div>
                                         <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Scholar Matrix Management</h2>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedCohort?.cohortName} • Enrollment Registry</p>
                                     </div>
                                 </div>
                             </div>

                             {assignLoading ? (
                                 <div className="py-20 text-center uppercase text-[10px] font-black tracking-widest animate-pulse">Accessing Course Scholar Records...</div>
                             ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-emerald-100">
                                     {courseStudents.map(student => {
                                         const isEnrolled = selectedCohort.students?.includes(student._id);
                                         return (
                                             <div key={student._id} className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${
                                                 isEnrolled ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/10' : 'bg-slate-50 border-transparent hover:border-slate-300'
                                             }`}>
                                                 <div className="flex items-center gap-4">
                                                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100 uppercase">{student.name.charAt(0)}</div>
                                                     <div className="flex flex-col">
                                                         <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{student.name}</span>
                                                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{student.email}</span>
                                                     </div>
                                                 </div>
                                                 <button
                                                     onClick={() => toggleStudentInCohort(student._id, isEnrolled)}
                                                     className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                                         isEnrolled ? 'bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                                     }`}
                                                 >
                                                     {isEnrolled ? 'Unassign' : 'Assign'}
                                                 </button>
                                             </div>
                                         );
                                     })}
                                 </div>
                             )}
                        </div>
                    )}
                    {/* 4. Announcement Modal */}
                    {activeModal === 'announcement' && (
                        <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden p-12 relative animate-in fade-in zoom-in duration-300">
                             <button onClick={() => setActiveModal(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-2"><X size={24} /></button>
                             <div className="flex items-center gap-6 mb-12">
                                 <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><MessageSquare size={28} /></div>
                                 <div>
                                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Dispatch Notice Signal</h2>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cohort: {selectedCohort?.cohortName}</p>
                                 </div>
                             </div>
                             <form onSubmit={handleSendAnnouncement} className="space-y-8">
                                 <div className="space-y-3">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notice Title</label>
                                     <input required type="text" placeholder="e.g. Schedule Change Alert" className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-8 text-sm font-bold outline-none" value={announcementData.title} onChange={(e) => setAnnouncementData({...announcementData, title: e.target.value})}/>
                                 </div>
                                 <div className="space-y-3">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notice Payload</label>
                                     <textarea required placeholder="Compose your instructional signal..." className="w-full h-40 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-8 py-6 text-sm font-bold outline-none resize-none" value={announcementData.content} onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})}/>
                                 </div>
                                 <div className="space-y-3">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Priority Level</label>
                                     <div className="flex gap-4">
                                         {['normal', 'urgent', 'critical'].map(p => (
                                             <button 
                                                key={p}
                                                type="button"
                                                onClick={() => setAnnouncementData({...announcementData, priority: p})}
                                                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    announcementData.priority === p 
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                }`}
                                             >
                                                 {p}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                                 <button className="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all">Broadcast Notice</button>
                             </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageCohorts;


