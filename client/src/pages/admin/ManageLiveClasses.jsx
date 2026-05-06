import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    BellRing,
    Calendar,
    Clock,
    Filter,
    Radio,
    RefreshCw,
    Settings2,
    Users,
    Video
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/utils/api';
import { AppContext } from '../../context/AppContextObject.jsx';

const defaultLiveSettings = {
    live_default_duration: 60,
    live_fallback_policy: 'allow_external_fallback',
    live_attendance_policy: 'mark_on_join',
    live_reminders_enabled: 'Yes',
    live_reminder_minutes: 15
};

const filterDefaults = {
    status: 'all',
    provider: 'all',
    instructor: 'all',
    cohort: 'all',
    course: 'all',
    institute: 'all',
    department: 'all',
    health: 'all',
    search: ''
};

const MetricCard = ({ icon: Icon, label, value, accent = 'emerald' }) => (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-lg shadow-slate-200/20">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                accent === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                accent === 'rose' ? 'bg-rose-50 text-rose-600' :
                accent === 'amber' ? 'bg-amber-50 text-amber-600' :
                'bg-indigo-50 text-indigo-600'
            }`}>
                <Icon size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">{label}</span>
        </div>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
);

const formatDateTime = (value) => {
    if (!value) return 'Unknown time';
    return new Date(value).toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ManageLiveClasses = () => {
    const { updateBatchSettings } = useContext(AppContext);
    const [dashboard, setDashboard] = useState(null);
    const [detail, setDetail] = useState(null);
    const [filters, setFilters] = useState(filterDefaults);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState(defaultLiveSettings);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.set(key, value);
        });
        return params.toString();
    }, [filters]);

    useEffect(() => {
        fetchDashboard();
    }, [queryString]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/live/overview${queryString ? `?${queryString}` : ''}`);
            if (data.success) {
                setDashboard(data);
                setSettingsForm({
                    ...defaultLiveSettings,
                    ...data.settings
                });
                if (detail?._id) {
                    const updated = data.sessions.find((session) => session._id === detail._id);
                    if (updated) {
                        setDetail((prev) => ({ ...prev, ...updated }));
                    }
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to synchronize live operations.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (sessionId) => {
        setDetailLoading(true);
        try {
            const { data } = await api.get(`/admin/live/sessions/${sessionId}`);
            if (data.success) {
                setDetail(data.session);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load session detail.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const success = await updateBatchSettings(settingsForm);
            if (success) {
                toast.success('Live classroom settings synchronized.');
                await fetchDashboard();
            }
        } finally {
            setSavingSettings(false);
        }
    };

    const handleDispatchReminders = async () => {
        const loadingToast = toast.loading('Dispatching due reminders...');
        try {
            const { data } = await api.post('/admin/live/reminders/dispatch');
            toast.update(loadingToast, {
                render: `${data.remindersSent} reminder batches sent to ${data.recipientsNotified} participants.`,
                type: 'success',
                isLoading: false,
                autoClose: 3500
            });
            await fetchDashboard();
        } catch (error) {
            toast.update(loadingToast, {
                render: error.response?.data?.message || 'Reminder dispatch failed.',
                type: 'error',
                isLoading: false,
                autoClose: 3500
            });
        }
    };

    const handleSendReminder = async (sessionId) => {
        const loadingToast = toast.loading('Sending reminder...');
        try {
            const { data } = await api.post(`/admin/live/sessions/${sessionId}/remind`, { reminderType: 'scheduled' });
            toast.update(loadingToast, {
                render: `Reminder sent to ${data.recipientCount} learners.`,
                type: 'success',
                isLoading: false,
                autoClose: 3200
            });
            await fetchDashboard();
            if (detail?._id === sessionId) {
                fetchDetail(sessionId);
            }
        } catch (error) {
            toast.update(loadingToast, {
                render: error.response?.data?.message || 'Reminder send failed.',
                type: 'error',
                isLoading: false,
                autoClose: 3200
            });
        }
    };

    const handleCancelSession = async (sessionId) => {
        try {
            const { data } = await api.patch(`/admin/live/sessions/${sessionId}/cancel`);
            if (data.success) {
                toast.success('Live session cancelled.');
                await fetchDashboard();
                if (detail?._id === sessionId) {
                    setDetail(data.session);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel live session.');
        }
    };

    const handleSaveEdit = async (event) => {
        event.preventDefault();
        try {
            const { data } = await api.put(`/admin/live/sessions/${editForm._id}`, {
                title: editForm.title,
                startTime: editForm.startTime,
                duration: Number(editForm.duration),
                provider: editForm.provider,
                meetingLink: editForm.meetingLink,
                recordingUrl: editForm.recordingUrl,
                sessionStatus: editForm.sessionStatus
            });
            if (data.success) {
                toast.success('Live session governance updated.');
                setShowEditModal(false);
                setEditForm(null);
                await fetchDashboard();
                if (detail?._id === data.session._id) {
                    await fetchDetail(data.session._id);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update session.');
        }
    };

    const openEditModal = (session) => {
        setEditForm({
            _id: session._id,
            title: session.title,
            startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
            duration: session.duration || 60,
            provider: session.provider || 'livekit',
            meetingLink: session.meetingLink || '',
            recordingUrl: session.recordingUrl || '',
            sessionStatus: session.sessionStatus || 'scheduled'
        });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">Synchronizing Live Operations...</p>
            </div>
        );
    }

    const analytics = dashboard?.analytics || {};
    const sessions = dashboard?.sessions || [];
    const filterOptions = dashboard?.filterOptions || {};

    return (
        <div className="max-w-[1680px] mx-auto space-y-10 pb-20">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-3">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Live Operations</h1>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.35em] opacity-80">
                        Platform-wide classroom governance, reminders, and participation oversight
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className={`px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                        dashboard?.configuration?.livekitConfigured
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                        {dashboard?.configuration?.livekitConfigured ? 'LiveKit Ready' : 'LiveKit Needs Config'}
                    </div>
                    <button
                        onClick={handleDispatchReminders}
                        className="h-14 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all flex items-center gap-3"
                    >
                        <BellRing size={16} />
                        <span>Send Due Reminders</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
                <MetricCard icon={Video} label="Total Sessions" value={analytics.totalSessions || 0} />
                <MetricCard icon={Radio} label="Live Now" value={analytics.liveNow || 0} accent="rose" />
                <MetricCard icon={Calendar} label="Upcoming" value={analytics.upcoming || 0} accent="indigo" />
                <MetricCard icon={Users} label="Attendance Rate" value={`${analytics.attendanceRate || 0}%`} accent="emerald" />
                <MetricCard icon={AlertTriangle} label="No Shows" value={analytics.noShows || 0} accent="amber" />
                <MetricCard icon={BellRing} label="Due Reminders" value={dashboard?.configuration?.dueReminders || 0} accent="indigo" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-8">
                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Session Registry</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2">
                                    Filter platform-wide live classrooms by delivery health and ownership
                                </p>
                            </div>
                            <button
                                onClick={fetchDashboard}
                                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center hover:text-emerald-600 transition-all"
                                title="Refresh"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Statuses</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="live">Live</option>
                                <option value="past">Past</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select value={filters.provider} onChange={(e) => setFilters((prev) => ({ ...prev, provider: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Providers</option>
                                <option value="livekit">LiveKit</option>
                                <option value="external">External</option>
                            </select>
                            <select value={filters.health} onChange={(e) => setFilters((prev) => ({ ...prev, health: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Health Signals</option>
                                <option value="missing-recording">Missing Recording</option>
                                <option value="no-show">No Show</option>
                                <option value="missing-fallback">Missing Fallback</option>
                            </select>
                            <input value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} placeholder="Search title / cohort / educator" className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 outline-none placeholder:text-slate-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                            <select value={filters.instructor} onChange={(e) => setFilters((prev) => ({ ...prev, instructor: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Educators</option>
                                {(filterOptions.instructors || []).map((item) => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                            <select value={filters.cohort} onChange={(e) => setFilters((prev) => ({ ...prev, cohort: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Cohorts</option>
                                {(filterOptions.cohorts || []).map((item) => (
                                    <option key={item._id} value={item._id}>{item.cohortName}</option>
                                ))}
                            </select>
                            <select value={filters.course} onChange={(e) => setFilters((prev) => ({ ...prev, course: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Courses</option>
                                {(filterOptions.courses || []).map((item) => (
                                    <option key={item._id} value={item._id}>{item.courseTitle}</option>
                                ))}
                            </select>
                            <select value={filters.institute} onChange={(e) => setFilters((prev) => ({ ...prev, institute: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Institutes</option>
                                {(filterOptions.institutes || []).map((item) => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                            <select value={filters.department} onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-xs font-black text-slate-700 uppercase tracking-widest outline-none">
                                <option value="all">All Departments</option>
                                {(filterOptions.departments || []).map((item) => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <div className="py-16 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                    <Filter size={32} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">No live sessions match this operational filter set</p>
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div key={session._id} className="border border-slate-100 rounded-[2rem] p-6 hover:border-emerald-200 transition-all">
                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{session.title}</h3>
                                                    <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                                                        session.lifecycleState === 'live'
                                                            ? 'bg-rose-500 text-white'
                                                            : session.lifecycleState === 'upcoming'
                                                                ? 'bg-indigo-50 text-indigo-700'
                                                                : session.lifecycleState === 'cancelled'
                                                                    ? 'bg-slate-200 text-slate-700'
                                                                    : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                        {session.lifecycleState}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                                                        {session.provider}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                                    {[session.cohortId?.cohortName, session.cohortId?.courseId?.courseTitle, session.cohortId?.instructorId?.name].filter(Boolean).join(' | ')}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(session.startTime).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-2"><Clock size={12} /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="flex items-center gap-2"><Users size={12} /> {session.presentParticipants}/{session.expectedParticipants}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                {session.healthSignals?.missingRecording && (
                                                    <span className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest">Missing Recording</span>
                                                )}
                                                {session.healthSignals?.noShow && (
                                                    <span className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-widest">No Show</span>
                                                )}
                                                <button onClick={() => fetchDetail(session._id)} className="h-12 px-4 rounded-2xl bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Review</button>
                                                <button onClick={() => handleSendReminder(session._id)} className="h-12 px-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Remind</button>
                                                <button onClick={() => openEditModal(session)} className="h-12 px-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">Edit</button>
                                                <button onClick={() => handleCancelSession(session._id)} className="h-12 px-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Top Live Educators</h2>
                            <div className="space-y-4">
                                {(analytics.topInstructors || []).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{item.name}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.sessions} sessions | {item.liveSessions} live</p>
                                        </div>
                                        <span className="text-lg font-black text-emerald-600">{item.participants}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Top Cohorts</h2>
                            <div className="space-y-4">
                                {(analytics.topCohorts || []).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{item.cohortName}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.sessions} sessions</p>
                                        </div>
                                        <span className="text-lg font-black text-indigo-600">{item.avgParticipationRate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings2 className="text-emerald-600" size={18} />
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Live Settings</h2>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Duration (Minutes)</label>
                                <input type="number" value={settingsForm.live_default_duration} onChange={(e) => setSettingsForm((prev) => ({ ...prev, live_default_duration: Number(e.target.value) }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fallback Policy</label>
                                <select value={settingsForm.live_fallback_policy} onChange={(e) => setSettingsForm((prev) => ({ ...prev, live_fallback_policy: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none">
                                    <option value="allow_external_fallback">Allow External Fallback</option>
                                    <option value="prefer_livekit_only">Prefer LiveKit Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attendance Policy</label>
                                <select value={settingsForm.live_attendance_policy} onChange={(e) => setSettingsForm((prev) => ({ ...prev, live_attendance_policy: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none">
                                    <option value="mark_on_join">Mark on Join</option>
                                    <option value="manual_review">Manual Review</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reminders Enabled</label>
                                    <select value={settingsForm.live_reminders_enabled} onChange={(e) => setSettingsForm((prev) => ({ ...prev, live_reminders_enabled: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none">
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reminder Window</label>
                                    <input type="number" value={settingsForm.live_reminder_minutes} onChange={(e) => setSettingsForm((prev) => ({ ...prev, live_reminder_minutes: Number(e.target.value) }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" />
                                </div>
                            </div>
                            <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full h-14 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all disabled:opacity-60">
                                {savingSettings ? 'Saving...' : 'Save Live Settings'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20 min-h-[320px]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Session Detail</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Attendance, recording, and audit visibility</p>
                            </div>
                            {detail && (
                                <button onClick={() => openEditModal(detail)} className="h-11 px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                    Edit
                                </button>
                            )}
                        </div>

                        {detailLoading ? (
                            <div className="py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">Loading Session Detail...</div>
                        ) : !detail ? (
                            <div className="py-16 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <Activity size={28} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">Select a live session to inspect governance data</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{detail.title}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                        {[detail.cohortId?.cohortName, detail.cohortId?.courseId?.courseTitle].filter(Boolean).join(' | ')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Participants</p>
                                        <p className="text-2xl font-black text-slate-900">{detail.presentParticipants}/{detail.expectedParticipants}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Recording</p>
                                        <p className="text-sm font-black text-slate-900">{detail.recordingUrl ? 'Linked' : 'Missing'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor / Organization</p>
                                    <div className="p-4 rounded-2xl bg-slate-50 text-sm font-bold text-slate-700">
                                        <p>{detail.cohortId?.instructorId?.name || 'Unknown instructor'}</p>
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            {[detail.cohortId?.instructorId?.institute?.name || 'No institute', detail.cohortId?.instructorId?.department?.name || 'No department'].join(' | ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Signals</p>
                                    <div className="flex flex-wrap gap-3">
                                        <span className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${detail.healthSignals?.missingRecording ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {detail.healthSignals?.missingRecording ? 'Recording Missing' : 'Recording Healthy'}
                                        </span>
                                        <span className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${detail.healthSignals?.noShow ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {detail.healthSignals?.noShow ? 'No Show Risk' : 'Attendance Healthy'}
                                        </span>
                                        <span className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${detail.provider === 'external' && !detail.meetingLink ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {detail.provider === 'external' && !detail.meetingLink ? 'Fallback Missing' : 'Fallback Ready'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</p>
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                        {(detail.activityLog || []).slice().reverse().map((log, index) => (
                                            <div key={`${log.createdAt}-${index}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.action}</p>
                                                <p className="text-xs font-bold text-slate-500 mt-1">{[log.actorName, formatDateTime(log.createdAt)].filter(Boolean).join(' | ')}</p>
                                                {log.note ? <p className="text-xs text-slate-500 mt-2">{log.note}</p> : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEditModal && editForm && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Live Session</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Admin moderation and delivery controls</p>
                            </div>
                            <button onClick={() => { setShowEditModal(false); setEditForm(null); }} className="text-slate-400 hover:text-slate-900 text-sm font-black uppercase tracking-widest">Close</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-6">
                            <input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" placeholder="Session title" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="datetime-local" value={editForm.startTime} onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" required />
                                <input type="number" value={editForm.duration} onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select value={editForm.provider} onChange={(e) => setEditForm((prev) => ({ ...prev, provider: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none">
                                    <option value="livekit">LiveKit Classroom</option>
                                    <option value="external">External Meeting Link</option>
                                </select>
                                <select value={editForm.sessionStatus} onChange={(e) => setEditForm((prev) => ({ ...prev, sessionStatus: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none">
                                    <option value="scheduled">Scheduled</option>
                                    <option value="live">Live</option>
                                    <option value="ended">Ended</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <input value={editForm.meetingLink} onChange={(e) => setEditForm((prev) => ({ ...prev, meetingLink: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" placeholder="Fallback meeting link" />
                            <input value={editForm.recordingUrl} onChange={(e) => setEditForm((prev) => ({ ...prev, recordingUrl: e.target.value }))} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold outline-none" placeholder="Recording URL" />
                            <button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all">
                                Save Live Session
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLiveClasses;

