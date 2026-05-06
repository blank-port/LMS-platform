import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const AdminSettings = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [settings, setSettings] = useState({
        razorpay_key_id: '',
        razorpay_key_secret: '',
        razorpay_enabled: true,
        cod_enabled: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/setting/all');
            if (data.success) {
                const sObj = {};
                data.settings.forEach(s => sObj[s.key] = s.value);
                setSettings(prev => ({ ...prev, ...sObj }));
            }
        } catch (error) {
            toast.error("Configuration Retrieval Failure");
        }
    };

    const handleUpdate = async (key, value, isSensitive = false) => {
        try {
            const { data } = await api.post('/setting/update', {
                key, value, isSensitive
            });
            
            if (data.success) {
                // Individual update success handled silently to prevent toast flooding during batch
            }
        } catch (error) {
            throw new Error(`Failed to synchronize ${key}`);
        }
    };

    const saveAll = async () => {
        setLoading(true);
        const actionToast = toast.loading('Synchronizing System Parameters...');
        try {
            const keys = Object.keys(settings);
            for (const key of keys) {
                const isSec = key.includes('secret');
                await handleUpdate(key, settings[key], isSec);
            }
            toast.update(actionToast, { render: 'System Parameters synchronized.', type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">System Parameter Configuration</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Core Infrastructure & Payment Integration Settings</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interface Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Financial Infrastructure */}
                <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <span className="text-9xl font-black">💳</span>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-[var(--text-main)] mb-6 flex items-center gap-3 font-black">
                            Transaction Layer
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Razorpay Key ID</label>
                                <input 
                                    type="text"
                                    value={settings.razorpay_key_id}
                                    onChange={(e) => setSettings({...settings, razorpay_key_id: e.target.value})}
                                    className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                    placeholder="rzp_test_endpoint"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Razorpay Managed Secret</label>
                                <input 
                                    type="password"
                                    value={settings.razorpay_key_secret}
                                    onChange={(e) => setSettings({...settings, razorpay_key_secret: e.target.value})}
                                    className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                    placeholder="••••••••••••••••"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Economic Protocol Settings */}
                <div className="space-y-8">
                    <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 space-y-6">
                        <h2 className="text-xl font-black text-[var(--text-main)] mb-6 font-black">
                            Economic Protocols
                        </h2>
                        
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-5 bg-[var(--background)]/50 rounded-2xl border border-[var(--border)] cursor-pointer group hover:bg-[var(--surface)] hover:shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${settings.razorpay_enabled ? 'bg-purple-100 text-purple-400' : 'bg-gray-200 text-gray-400'}`}>
                                        💳
                                    </div>
                                    <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--text-main)] transition-colors">Digital Settlement</span>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={settings.razorpay_enabled}
                                    onChange={(e) => setSettings({...settings, razorpay_enabled: e.target.checked})}
                                    className="w-6 h-6 rounded-lg border-[var(--border)] text-[var(--text-main)] focus:ring-purple-500 cursor-pointer transition-all"
                                />
                            </label>

                            <label className="flex items-center justify-between p-5 bg-[var(--background)]/50 rounded-2xl border border-[var(--border)] cursor-pointer group hover:bg-[var(--surface)] hover:shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${settings.cod_enabled ? 'bg-amber-100 text-amber-400' : 'bg-gray-200 text-gray-400'}`}>
                                        💵
                                    </div>
                                    <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--text-main)] transition-colors">Direct Remittance</span>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={settings.cod_enabled}
                                    onChange={(e) => setSettings({...settings, cod_enabled: e.target.checked})}
                                    className="w-6 h-6 rounded-lg border-[var(--border)] text-[var(--text-main)] focus:ring-purple-500 cursor-pointer transition-all"
                                />
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={saveAll}
                        disabled={loading}
                        className="w-full h-20 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-black/10 hover:bg-purple-600 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Synchronizing..." : "Synchronize System Configuration"}
                    </button>
                </div>
            </div>

            {/* Support Note */}
            <div className="p-8 bg-purple-50/50 rounded-[2.5rem] border border-purple-800/30">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] leading-relaxed">
                    <span className="font-black mr-2">Warning:</span> Modifications to core infrastructure parameters may affect global transaction flows. Identity verification is automatically applied to all sensitive configuration updates.
                </p>
            </div>
        </div>
    );
};

export default AdminSettings;





