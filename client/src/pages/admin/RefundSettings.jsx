import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const RefundSettings = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        enableRefunds: true,
        refundWindowDays: 7,
        cancellationFee: 0,
        automaticRefundApproval: false,
        refundTerms: 'Standard institutional refund protocols apply.'
    });

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/finance/refund-settings`, getHeaders());
            if (data.success) setSettings(data.settings);
        } catch (error) {
            console.error('Settings retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const actionToast = toast.loading('Synchronizing Refund Policies...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/finance/refund-settings`, settings, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Refund policies synchronized.', type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-red-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Fiscal Return Parameters...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Fiscal Return Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Refund Policies & Strategic Cancellation Parameters</p>
                </div>
                <button onClick={handleSave}
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-red-600 transition-all shadow-2xl shadow-black/10">
                    💾 Persist Policies
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] border-b border-red-50 pb-4">Refund Protocol Matrix</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Enable Global Refunds</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Allow scholars to initiate return protocols</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-red-600" checked={settings.enableRefunds} onChange={e => setSettings({ ...settings, enableRefunds: e.target.checked })} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Auto-Authorize Refunds</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Bypass executive review for standard returns</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-red-600" checked={settings.automaticRefundApproval} onChange={e => setSettings({ ...settings, automaticRefundApproval: e.target.checked })} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] border-b border-red-50 pb-4">Thresholds & Penalties</h3>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Refund Window (Days)</label>
                            <input type="number" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.refundWindowDays} onChange={e => setSettings({ ...settings, refundWindowDays: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cancellation Protocol Fee (%)</label>
                            <input type="number" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.cancellationFee} onChange={e => setSettings({ ...settings, cancellationFee: parseInt(e.target.value) })} />
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-[var(--border)]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-4">Refund Protocol Declaration (Terms)</label>
                    <textarea className="w-full px-8 py-6 border border-[var(--border)] rounded-[2.5rem] bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm min-h-[150px]" value={settings.refundTerms} onChange={e => setSettings({ ...settings, refundTerms: e.target.value })} />
                </div>
            </div>
        </div>
    );
};

export default RefundSettings;
