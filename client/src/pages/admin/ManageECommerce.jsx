import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageECommerce = () => {
    const [referrals, setReferrals] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [settings, setSettings] = useState({ 
        referralCommission: 10, 
        instructorShare: 70,
        testDummyField: 'Initial Alpha'
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: settingsData } = await api.get('/setting/public');
            
            if (settingsData.success) {
                setSettings({
                    referralCommission: settingsData.settings.referralCommission ?? 10,
                    instructorShare: settingsData.settings.instructorShare ?? 70,
                    testDummyField: settingsData.settings.testDummyField ?? 'Initial Alpha'
                });
            }

            // Mocking data for referral/payout tables
            setReferrals([
                { id: 'REF-001X', referrer: 'Dr. Sarah Jenkins', referred: 'Emily Blunt', commission: '₹150', status: 'Synchronized', date: '2023-11-20' },
                { id: 'REF-002Y', referrer: 'Prof. Marcus Aurelius', referred: 'James Clear', commission: '₹150', status: 'Pending', date: '2023-11-21' }
            ]);
            setPayouts([
                { instructor: 'Dr. Sarah Jenkins', amount: '₹45,200', bank: 'ICICI ****8821', status: 'Dispatched', ref: 'PAY-882' },
                { instructor: 'Prof. Marcus Aurelius', amount: '₹12,400', bank: 'HDFC ****4410', status: 'Queued', ref: 'PAY-883' }
            ]);
        } catch (error) {
            toast.error('Transactional Intelligence Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const { data } = await api.post('/setting/update-batch', {
                settings: settings,
                isSensitive: false
            });

            if (data.success) {
                toast.success('Strategic Architecture Recalibrated');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Calibration Failure');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Economic Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-10">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Economic Ecosystem</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Global Transactional Infrastructure & Revenue Distribution Matrix</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-600 transition-all shadow-lg shadow-black/10">
                        Export Transaction Vault
                    </button>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Referral Tracking Card */}
                <div className="bg-[var(--surface)] rounded-[3rem] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-8 border-b border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔗</span>
                            <h2 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">Referral Dynamics</h2>
                        </div>
                        <span className="px-3 py-1 bg-purple-900/20 text-purple-400 text-[9px] font-black rounded-full uppercase tracking-widest">Active Attribution</span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--background)]/50">
                                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Attribution Source</th>
                                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Reward</th>
                                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {referrals.map(r => (
                                    <tr key={r.id} className="group hover:bg-[var(--background)]/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[var(--text-main)] tracking-tight">{r.referrer}</span>
                                                <span className="text-[10px] font-bold text-gray-400 mt-0.5 italic">Referred: {r.referred}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-sm font-black text-[var(--text-main)] font-mono tracking-tighter">{r.commission}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${r.status === 'Synchronized' ? 'bg-green-900/20 border-green-800/30 text-green-400' : 'bg-amber-900/20 border-amber-800/30 text-amber-400'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payout Infrastructure Card */}
                <div className="bg-[var(--surface)] rounded-[3rem] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-8 border-b border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏦</span>
                            <h2 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">Instructor Payouts</h2>
                        </div>
                        <span className="px-3 py-1 bg-blue-900/20 text-blue-400 text-[9px] font-black rounded-full uppercase tracking-widest">Settlement Engine</span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--background)]/50">
                                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Educator Asset</th>
                                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Net Value</th>
                                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {payouts.map((p, idx) => (
                                    <tr key={idx} className="group hover:bg-[var(--background)]/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[var(--text-main)] tracking-tight">{p.instructor}</span>
                                                <span className="text-[10px] font-bold text-gray-400 mt-0.5 font-mono">{p.bank}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-sm font-black text-[var(--text-main)] font-mono tracking-tighter">{p.amount}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${p.status === 'Dispatched' ? 'bg-indigo-900/20 border-indigo-100 text-indigo-600' : 'bg-[var(--background)] border-[var(--border)] text-gray-400'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Strategic Commerce Settings */}
            <div className="bg-gray-900 rounded-[4rem] p-12 shadow-2xl shadow-purple-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity">
                    <div className="w-64 h-64 bg-purple-500 rounded-full"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <span className="text-2xl">⚙️</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Commerce Architecture Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Referral Commission Attribution</label>
                                <span className="text-2xl font-black text-white font-mono">{settings.referralCommission}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                value={settings.referralCommission}
                                onChange={e => setSettings({ ...settings, referralCommission: e.target.value })}
                            />
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Determines the percentage yield for successful scholarship attributions.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Instructor Revenue Share (%)</label>
                                <span className="text-2xl font-black text-white font-mono">{settings.instructorShare}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                value={settings.instructorShare}
                                onChange={e => setSettings({ ...settings, instructorShare: parseInt(e.target.value) })}
                            />
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Calibrates the net revenue distribution for educational content providers.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Test Dummy Field</label>
                            </div>
                            <input 
                                type="text" 
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Enter Test Parameter..."
                                value={settings.testDummyField} 
                                onChange={e => setSettings({...settings, testDummyField: e.target.value})} 
                            />
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">User-defined strategic testing parameter for system validation.</p>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                        <button 
                            onClick={handleSaveSettings}
                            className="px-10 py-4 bg-[var(--surface)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                        >
                            Apply Strategic Calibration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageECommerce;





