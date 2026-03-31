import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const PayoutSettings = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        instructorCommission: 70,
        minimumPayoutAmount: 500,
        payoutFrequency: 'monthly', // weekly, monthly
        enableAutoPayout: false,
        paymentMethods: ['bank', 'paypal', 'stripe']
    });

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/finance/payout-settings`, getHeaders());
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Settings retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const actionToast = toast.loading('Synchronizing Remuneration Protocols...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/finance/payout-settings`, settings, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Remuneration protocols synchronized.', type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Remuneration Parameters...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Remuneration Architecture Oversight</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Instructor Revenue Share & Payout Synchronization Parameters</p>
                </div>
                <button onClick={handleSave} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    💾 Persist Architecture
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] border-b border-purple-50 pb-4">Revenue Allocation</h3>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Educator Commission (%)</label>
                            <input type="number" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.instructorCommission} onChange={e => setSettings({...settings, instructorCommission: parseInt(e.target.value)})} />
                            <p className="text-[9px] font-bold text-gray-400 uppercase italic">Institutional capture will be {100 - settings.instructorCommission}%.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] border-b border-purple-50 pb-4">Payout Thresholds</h3>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Minimum Disbursement Threshold (₹)</label>
                            <input type="number" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.minimumPayoutAmount} onChange={e => setSettings({...settings, minimumPayoutAmount: parseInt(e.target.value)})} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[var(--border)]">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Synchronization Frequency</label>
                        <select className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[11px] uppercase tracking-widest" value={settings.payoutFrequency} onChange={e => setSettings({...settings, payoutFrequency: e.target.value})}>
                            <option value="weekly">Weekly Cycle</option>
                            <option value="monthly">Monthly Cycle</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between pt-8">
                        <div>
                            <p className="text-sm font-black text-[var(--text-main)]">Auto-Disbursement Protocol</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enable automated systemic payouts</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.enableAutoPayout} onChange={e => setSettings({...settings, enableAutoPayout: e.target.checked})} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoutSettings;
