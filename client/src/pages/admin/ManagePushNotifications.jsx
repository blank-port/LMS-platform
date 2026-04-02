import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    BellIcon, 
    KeyIcon, 
    BoltIcon, 
    PaperAirplaneIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    UserGroupIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';

const ManagePushNotifications = () => {
    const { backendUrl, getHeaders, fetchAllSettings, updateBatchSettings } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('api');
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        fcm_project_id: '',
        fcm_client_email: '',
        fcm_private_key: '',
        pusher_app_id: '',
        pusher_app_key: '',
        pusher_app_secret: '',
        pusher_app_cluster: '',
    });

    const [matrix, setMatrix] = useState({
        notify_course_published: 'Yes',
        notify_new_enrollment: 'Yes',
        notify_assignment_submitted: 'No'
    });

    const [blast, setBlast] = useState({
        title: '',
        message: '',
        audience: 'All Students',
        image: null
    });

    const loadData = async () => {
        setLoading(true);
        const settings = await fetchAllSettings();
        if (settings) {
            const newConfig = { ...config };
            const newMatrix = { ...matrix };
            settings.forEach(s => {
                if (Object.keys(config).includes(s.key)) newConfig[s.key] = s.value;
                if (Object.keys(matrix).includes(s.key)) newMatrix[s.key] = s.value;
            });
            setConfig(newConfig);
            setMatrix(newMatrix);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSaveConfig = async () => {
        const success = await updateBatchSettings(config, true);
        if (success) toast.success('API Credentials Synchronized');
    };

    const handleSaveMatrix = async () => {
        const success = await updateBatchSettings(matrix);
        if (success) toast.success('Pedagogical Triggers Finalized');
    };

    const handleSendBlast = async () => {
        const loadingToast = toast.loading('Dispatching Strategic Alert...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/notification/broadcast`, blast, getHeaders());
            if (data.success) {
                toast.update(loadingToast, { render: data.message, type: 'success', isLoading: false, autoClose: 3000 });
                setBlast({ title: '', message: '', audience: 'All Students', image: null });
            }
        } catch (error) {
            toast.update(loadingToast, { render: 'Broadcast failure', type: 'error', isLoading: false, autoClose: 3000 });
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen animate-pulse text-gray-400 font-black uppercase tracking-[0.4em]">Initializing Communication Nexus...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Communication Hub</h1>
                    <p className="text-[var(--text-muted)] font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Omnichannel Push & Real-Time Alert Governance</p>
                </div>
                <div className="flex gap-2 bg-[var(--background)] p-1.5 rounded-2xl border border-[var(--border)]">
                    {['api', 'matrix', 'blast'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-indigo-400'}`}
                        >
                            {t === 'api' ? 'Infrastructure' : t === 'matrix' ? 'Triggers' : 'Announcer'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab 1: API Configuration */}
            {activeTab === 'api' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><ShieldCheckIcon className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Firebase FCM</h2>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Mobile & Browser Push Engine</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {['fcm_project_id', 'fcm_client_email'].map(k => (
                                <div key={k} className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{k.replace(/_/g, ' ')}</label>
                                    <input 
                                        type="text" 
                                        value={config[k]}
                                        onChange={e => setConfig({...config, [k]: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-main)] outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">FCM Private Key</label>
                                <textarea 
                                    value={config.fcm_private_key}
                                    onChange={e => setConfig({...config, fcm_private_key: e.target.value})}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-main)] outline-none focus:border-indigo-500/50 transition-all h-32 resize-none"
                                    placeholder="-----BEGIN PRIVATE KEY-----"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><BoltIcon className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Pusher Real-Time</h2>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Instant WebSocket Alerts</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {['pusher_app_id', 'pusher_app_key', 'pusher_app_secret', 'pusher_app_cluster'].map(k => (
                                <div key={k} className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{k.replace(/_/g, ' ')}</label>
                                    <input 
                                        type={k.includes('secret') ? 'password' : 'text'}
                                        value={config[k]}
                                        onChange={e => setConfig({...config, [k]: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-main)] outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSaveConfig} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-500 shadow-xl shadow-indigo-500/10 transition-all active:scale-95">Synchronize Infrastructure</button>
                    </div>
                </div>
            )}

            {/* Tab 2: Trigger Matrix */}
            {activeTab === 'matrix' && (
                <div className="bg-[var(--surface)] rounded-[3rem] border border-[var(--border)] overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                    <div className="p-10 border-b border-[var(--border)] flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Pedagogical Trigger Matrix</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Automated behavioral push event mappings</p>
                        </div>
                        <button onClick={handleSaveMatrix} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10">Authorize Matrix</button>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {Object.entries(matrix).map(([key, val]) => (
                            <div key={key} className="p-10 flex items-center justify-between group hover:bg-[var(--background)]/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`w-3 h-3 rounded-full ${val === 'Yes' ? 'bg-indigo-500' : 'bg-gray-700'}`}></div>
                                    <div>
                                        <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">{key.replace('notify_', '').replace(/_/g, ' ')}</h3>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Automated push alert enabled for this scholars interaction</p>
                                    </div>
                                </div>
                                <select 
                                    value={val}
                                    onChange={e => setMatrix({...matrix, [key]: e.target.value})}
                                    className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-6 py-3 text-[10px] font-black text-[var(--text-main)] outline-none focus:border-indigo-500/50"
                                >
                                    <option value="Yes">PUSH ENABLED</option>
                                    <option value="No">DISABLED</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 3: Blast Center */}
            {activeTab === 'blast' && (
                <div className="max-w-4xl mx-auto bg-[var(--surface)] p-12 rounded-[4rem] border border-[var(--border)] shadow-2xl shadow-indigo-500/5 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center text-red-500"><PaperAirplaneIcon className="w-8 h-8" /></div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">Strategic Announcement Composer</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Manual mass-broadcast interface</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Announcement Title</label>
                                <input 
                                    type="text" 
                                    value={blast.title}
                                    onChange={e => setBlast({...blast, title: e.target.value})}
                                    placeholder="Enter strategic header..."
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 text-sm font-bold text-[var(--text-main)] outline-none focus:border-red-500/40"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Dimension</label>
                                <select 
                                    value={blast.audience}
                                    onChange={e => setBlast({...blast, audience: e.target.value})}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 text-sm font-bold text-[var(--text-main)] outline-none focus:border-red-500/40"
                                >
                                    <option>All Students</option>
                                    <option>Educators Only</option>
                                    <option>Premium Subscribers</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Narrative Details</label>
                            <textarea 
                                value={blast.message}
                                onChange={e => setBlast({...blast, message: e.target.value})}
                                placeholder="Specify the intellectual announcement details..."
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] px-8 py-8 text-sm font-medium text-[var(--text-main)] outline-none focus:border-red-500/40 h-48 resize-none leading-relaxed"
                            />
                        </div>

                        <div className="flex items-center justify-between p-8 bg-[var(--background)]/50 rounded-[2rem] border border-dashed border-[var(--border)] group hover:border-red-500/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <PhotoIcon className="w-8 h-8 text-gray-600 group-hover:text-red-500 transition-colors" />
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest">Attach Visual Assets</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Rich media notifications increase engagement by 40%</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/20 px-6 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">Browse</button>
                        </div>

                        <button 
                            onClick={handleSendBlast}
                            className="w-full py-6 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.5em] shadow-2xl shadow-red-500/20 hover:bg-red-500 transition-all active:scale-[0.99]"
                        >
                            Execute Global Broadcast
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePushNotifications;
