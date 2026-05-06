import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageCertificateSettings = () => {
    const { backendUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        enableAutoGeneration: true,
        generationTrigger: 'course_completion', // course_completion, quiz_passed
        signatureName: 'Academic Director',
        signaturePosition: 'Director of Pedagogy',
        institutionLogo: '',
        verificationPortal: true
    });

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/finance/certificate-settings');
            if (data.success) setSettings(data.settings);
        } catch (error) {
            console.error('Settings retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const actionToast = toast.loading('Synchronizing Issuance Protocols...');
        try {
            const { data } = await api.post('/finance/certificate-settings', settings);
            if (data.success) {
                toast.update(actionToast, { render: 'Issuance protocols synchronized.', type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Issuance Parameters...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Issuance Protocol Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Automated Credentialing & Institutional Verification Parameters</p>
                </div>
                <button onClick={handleSave} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    💾 Persist Protocols
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] border-b border-purple-50 pb-4">Automation Matrix</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Auto-Generation Protocol</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Automatic issuance upon milestone completion</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.enableAutoGeneration} onChange={e => setSettings({...settings, enableAutoGeneration: e.target.checked})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Triggering Event</label>
                            <select className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[11px] uppercase tracking-widest" value={settings.generationTrigger} onChange={e => setSettings({...settings, generationTrigger: e.target.value})}>
                                <option value="course_completion">Course Blueprint Finalization</option>
                                <option value="quiz_passed">Final Assessment Mastery</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] border-b border-purple-50 pb-4">Verification Protocols</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Global Verification Portal</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enable public credential validation nodes</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.verificationPortal} onChange={e => setSettings({...settings, verificationPortal: e.target.checked})} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[var(--border)]">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorized Identity Signatory</label>
                        <input type="text" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.signatureName} onChange={e => setSettings({...settings, signatureName: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Signatory Tactical Role</label>
                        <input type="text" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.signaturePosition} onChange={e => setSettings({...settings, signaturePosition: e.target.value})} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCertificateSettings;




