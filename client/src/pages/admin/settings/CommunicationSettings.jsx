import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Settings, ShieldCheck, Bell, MessageSquare, Save, UserCheck } from 'lucide-react';

const CommunicationSettings = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [settings, setSettings] = useState({
        allowQuestionReplyRoles: ['admin', 'instructor'],
        realtimeNotifications: true,
        autoApproveComments: true,
        profanityFilter: false,
        maxMessageLength: 2000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/comm/settings`, getHeaders());
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (error) {
            toast.error('Strategic Settings Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendUrl}/api/comm/settings`, settings, getHeaders());
            if (data.success) {
                toast.success('Institutional Protocols Synchronized');
            }
        } catch (error) {
            toast.error('Protocol Synchronization Failure');
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = (role) => {
        setSettings(prev => ({
            ...prev,
            allowQuestionReplyRoles: prev.allowQuestionReplyRoles.includes(role)
                ? prev.allowQuestionReplyRoles.filter(r => r !== role)
                : [...prev.allowQuestionReplyRoles, role]
        }));
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Protocol Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 mt-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nexus Protocols</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Communication Rules & Interaction Governance</p>
                </div>
                <button 
                    onClick={handleUpdate} 
                    disabled={saving}
                    className="h-14 px-8 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-100 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                    <Save size={14} /> Synchronize Protocols
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Authority Settings */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/30">
                    <div className="flex items-center gap-4 mb-10">
                        <UserCheck className="text-indigo-400" />
                        <h3 className="text-lg font-black text-gray-900 tracking-tight italic uppercase">Instructional Authority</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Responders (Q&A)</label>
                        <div className="flex flex-wrap gap-4">
                            {['admin', 'instructor', 'staff'].map(role => (
                                <button 
                                    key={role}
                                    onClick={() => toggleRole(role)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        settings.allowQuestionReplyRoles.includes(role) 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                                            : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-indigo-200'
                                    }`}
                                >
                                    {role} Node
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Automation & Moderation */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/30 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-emerald-400" />
                            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Moderation Control</h3>
                        </div>
                        
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                            <div>
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Auto-Approve Comments</p>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Bypass administrative review</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, autoApproveComments: !settings.autoApproveComments})}
                                className={`w-12 h-6 rounded-full relative transition-all ${settings.autoApproveComments ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoApproveComments ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <Bell className="text-amber-400" />
                            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Signal Pulse</h3>
                        </div>
                        
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                            <div>
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Real-time Sync</p>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Live notification ingestion</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, realtimeNotifications: !settings.realtimeNotifications})}
                                className={`w-12 h-6 rounded-full relative transition-all ${settings.realtimeNotifications ? 'bg-amber-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.realtimeNotifications ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Constraints */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/30">
                    <div className="flex items-center gap-4 mb-10">
                        <MessageSquare className="text-rose-400" />
                        <h3 className="text-lg font-black text-gray-900 tracking-tight italic uppercase">Communication Constraints</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Signal Magnitude (Characters)</label>
                        <input 
                            type="number" 
                            value={settings.maxMessageLength}
                            onChange={(e) => setSettings({...settings, maxMessageLength: Number(e.target.value)})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-8 text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationSettings;
