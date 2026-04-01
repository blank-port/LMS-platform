import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BarChart3, Settings, ShieldCheck, Zap, Award, Activity, History } from 'lucide-react';

const ManageGamification = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [settings, setSettings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'analytics'

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/gamification/settings`, getHeaders());
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (error) {
            toast.error('Strategic Settings Synchronization Failure');
        }
    };

    const fetchAdminStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/gamification/admin-stats`, getHeaders());
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load global analytics');
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        const actionToast = toast.loading('Synchronizing Behavioral Protocols...');
        try {
            const { data } = await axios.put(`${backendUrl}/api/gamification/settings`, { settings }, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Protocols stabilized.', type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failed.', type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setSaving(false);
        }
    };

    const handlePointChange = (id, value) => {
        setSettings(prev => prev.map(s => s._id === id ? { ...s, points: Number(value) } : s));
    };

    const handleStatusToggle = (id) => {
        setSettings(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([fetchSettings(), fetchAdminStats()]);
            setLoading(false);
        };
        loadInitialData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Gamification Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gamification Hub</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Engagement Protocols & Strategic Analytics</p>
                </div>
                
                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white shadow-xl shadow-gray-200 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Settings size={14} /> Logic Config
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-white shadow-xl shadow-gray-200 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <BarChart3 size={14} /> Global Intel
                    </button>
                </div>
            </div>

            {activeTab === 'settings' ? (
                <div className="space-y-12">
                    <div className="flex justify-between items-center">
                        <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                            Protocol Version v4.4.2
                        </div>
                        <button 
                            onClick={handleUpdate} 
                            disabled={saving}
                            className="h-14 px-10 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-100 transition-all disabled:opacity-50"
                        >
                            Deploy Protocols
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {settings.map((setting) => (
                            <div key={setting._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${setting.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                        {setting.isActive ? 'Operational' : 'Offline'}
                                    </span>
                                    <button 
                                        onClick={() => handleStatusToggle(setting._id)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${setting.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                    >
                                        <Zap size={16} fill={setting.isActive ? "none" : "currentColor"} />
                                    </button>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 capitalize italic">{setting.event.replace('_', ' ')}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 h-8 line-clamp-2">{setting.description}</p>
                                
                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Point Allocation</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number" 
                                            value={setting.points}
                                            onChange={(e) => handlePointChange(setting._id, e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl h-12 px-5 text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                                        />
                                        <div className="px-4 py-2 bg-indigo-50 rounded-lg text-indigo-600 text-[10px] font-black uppercase tracking-widest">PTS</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-[#0C132B] to-[#16213e] rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl border border-white/10 shadow-xl">💳</div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-black tracking-tight mb-2 italic">Cash Redemption Protocol</h2>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                    Strategic indices currently pegged at <span className="text-indigo-400">500 PTS per ₹1</span> capital gain. Institutional conversions are strictly automated based on scholar-initiated triggers once minimum solvency is reached.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem]">
                                <ShieldCheck className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Fiscal Integrity Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Total Intelligence Issued', value: stats?.totalPointsIssued?.toLocaleString() || 0, icon: <Activity className="text-indigo-500" /> },
                            { label: 'Active Achievement Types', value: stats?.activeBadgeCount || 0, icon: <Award className="text-amber-500" /> },
                            { label: 'Total Achievement Claims', value: stats?.badgeClaims || 0, icon: <ShieldCheck className="text-emerald-500" /> }
                        ].map((card, i) => (
                            <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-2">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl border border-gray-100">{card.icon}</div>
                                    <span className="text-[8px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Verified Metric</span>
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 italic">{card.value}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Global Activity */}
                    <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4 italic uppercase">
                                <History className="text-indigo-600" /> Live Point Ingestion Feed
                            </h3>
                            <button onClick={fetchAdminStats} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-all">Refresh Feed</button>
                        </div>

                        <div className="space-y-4">
                            {stats?.recentActivity?.map((log) => (
                                <div key={log._id} className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50/50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                                    <div className="flex items-center gap-8">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:rotate-12 transition-transform">🎓</div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-3 italic capitalize">
                                                {log.userId?.name || 'Anonymous Scholar'}
                                                <span className="text-[9px] font-black bg-white text-gray-400 px-2 py-0.5 rounded border border-gray-100 uppercase italic">{log.event.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                {new Date(log.createdAt).toLocaleString()} • Authentication Node: US-FAST-7
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-indigo-600 tracking-tighter">+{log.points} PTS</p>
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1 italic">Successful Sync</p>
                                    </div>
                                </div>
                            ))}
                            {!stats?.recentActivity?.length && (
                                <div className="text-center py-20 text-gray-300 italic text-sm font-black uppercase tracking-widest">Waiting for scholar engagement...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageGamification;
