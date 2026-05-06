import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    BuildingLibraryIcon, 
    CreditCardIcon, 
    CheckCircleIcon,
    GlobeAltIcon,
    CircleStackIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const PayoutSettings = () => {
    const { currency, fetchAllSettings, updateBatchSettings } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('global'); // 'global' or 'accounts'

    // Global Parameters State
    const [settings, setSettings] = useState({
        global_commission_percentage: 20, // Platform Retains
        minimumPayoutAmount: 500,
        payoutFrequency: 'monthly',
        enableAutoPayout: false,
        paymentMethods: ['bank', 'paypal', 'stripe']
    });

    // Account Configuration State
    const [methods, setMethods] = useState({
        payout_stripe_active: false,
        payout_paypal_active: false,
        payout_bank_active: false,
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Fetch Global
            const { data } = await api.get('/finance/payout-settings');
            // Map legacy 'instructorCommission' to 'global_commission_percentage' if needed
            if (data.success) {
                const fetched = data.settings;
                if (fetched.instructorCommission && !fetched.global_commission_percentage) {
                    fetched.global_commission_percentage = 100 - fetched.instructorCommission;
                }
                setSettings(prev => ({ ...prev, ...fetched }));
            }
            
            // Fetch Accounts (from Setting collection)
            const configData = await fetchAllSettings();
            if (configData && configData.length > 0) {
                const settingsMap = {};
                configData.forEach(s => settingsMap[s.key] = s.value);
                setMethods(prev => ({ 
                    ...prev, 
                    payout_stripe_active: settingsMap.payout_stripe_active === 'true' || settingsMap.payout_stripe_active === true,
                    payout_paypal_active: settingsMap.payout_paypal_active === 'true' || settingsMap.payout_paypal_active === true,
                    payout_bank_active: settingsMap.payout_bank_active === 'true' || settingsMap.payout_bank_active === true,
                }));
            }
        } catch (error) {
            console.error('Settings retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGlobal = async () => {
        const actionToast = toast.loading('Synchronizing Remuneration Protocols...');
        try {
            const { data } = await api.post('/finance/payout-settings', settings);
            if (data.success) {
                toast.update(actionToast, { render: 'Remuneration protocols synchronized.', type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleSaveAccounts = async () => {
        const actionToast = toast.loading('Applying Payout Policies...');
        const success = await updateBatchSettings(methods);
        if (success) {
            toast.update(actionToast, { render: 'Payout policies applied.', type: "success", isLoading: false, autoClose: 3000 });
        } else {
            toast.update(actionToast, { render: 'Policy application failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const providers = [
        { id: 'payout_stripe_active', name: 'Stripe Direct Connect', type: 'Instant Payout', icon: CreditCardIcon, color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
        { id: 'payout_paypal_active', name: 'PayPal Payouts', type: 'Standard Wallet', icon: GlobeAltIcon, color: 'text-blue-400', bg: 'bg-blue-900/20' },
        { id: 'payout_bank_active', name: 'Global Wire Transfer', type: 'NEFT/RTGS/SWIFT', icon: BuildingLibraryIcon, color: 'text-teal-400', bg: 'bg-teal-900/20' }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Remuneration Parameters...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[var(--border)] pb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Remuneration Architecture</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Institutional Disbursement & Revenue Sync Parameters</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)] shadow-inner">
                    <button 
                        onClick={() => setView('global')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'global' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Global Parameters
                    </button>
                    <button 
                        onClick={() => setView('accounts')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'accounts' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Account Configuration
                    </button>
                </div>
            </div>

            {view === 'global' ? (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {/* Remuneration Logic Card */}
                        <div className="bg-[var(--surface)] p-10 rounded-[3.5rem] border border-[var(--border)] space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                                <div className="w-10 h-10 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400">
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Remuneration Logic</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Commission (%)</label>
                                        <span className="text-purple-400 font-black text-xs">{settings.global_commission_percentage}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0"
                                        max="100"
                                        value={settings.global_commission_percentage} 
                                        onChange={e => setSettings({...settings, global_commission_percentage: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase italic">Platform Retains: {settings.global_commission_percentage}%</p>
                                        <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">Instructor: {100 - settings.global_commission_percentage}%</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Minimum Payout Threshold ({currency})</label>
                                    <input 
                                        type="number" 
                                        value={settings.minimumPayoutAmount} 
                                        onChange={e => setSettings({...settings, minimumPayoutAmount: parseInt(e.target.value)})}
                                        className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Synchronization Parameters */}
                        <div className="bg-[var(--surface)] p-10 rounded-[3.5rem] border border-[var(--border)] space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                                <div className="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400">
                                    <GlobeAltIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Synchronization Protocols</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Disbursement Frequency</label>
                                    <select 
                                        value={settings.payoutFrequency} 
                                        onChange={e => setSettings({...settings, payoutFrequency: e.target.value})}
                                        className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-black text-[var(--text-main)] text-[10px] uppercase tracking-widest"
                                    >
                                        <option value="weekly">Weekly Automated</option>
                                        <option value="monthly">Monthly Institutional</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-[var(--background)]/50 border border-[var(--border)] rounded-3xl">
                                    <div>
                                        <p className="text-sm font-black text-white">Auto-Disbursement</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Execute systemic wire transfers</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.enableAutoPayout} 
                                        onChange={e => setSettings({...settings, enableAutoPayout: e.target.checked})}
                                        className="w-6 h-6 rounded-lg accent-purple-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button 
                            onClick={handleSaveGlobal} 
                            className="h-16 px-12 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-600 transition-all shadow-2xl"
                        >
                            💾 Persist Architecture
                        </button>
                    </div>
                </div>
            ) : (
                /* Account Configuration View */
                <div className="space-y-10">
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <BuildingLibraryIcon className="w-40 h-40" />
                        </div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight mb-4 flex items-center gap-3">
                            <BuildingLibraryIcon className="w-6 h-6 text-purple-400" />
                            Disbursement Gateway Policies
                        </h3>
                        <p className="text-sm font-bold text-gray-500 max-w-2xl leading-relaxed uppercase tracking-wider text-[11px]">
                            Define authorized systemic payout channels. Instructors will calibrate their personal fiscal nodes from this set of authorized providers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {providers.map((provider) => (
                            <div key={provider.id} className="bg-[var(--surface)] p-8 rounded-[3rem] border border-[var(--border)] flex flex-col justify-between group hover:border-purple-500/50 transition-all">
                                <div className="space-y-6">
                                    <div className={`w-12 h-12 ${provider.bg} rounded-2xl flex items-center justify-center ${provider.color} transition-transform group-hover:scale-110`}>
                                        <provider.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white tracking-tight">{provider.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{provider.type}</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 rounded-lg accent-purple-600" 
                                        checked={methods[provider.id]} 
                                        onChange={() => setMethods(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button 
                            onClick={handleSaveAccounts}
                            className="h-16 px-12 bg-purple-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 transition-all shadow-2xl"
                        >
                            🏗️ Apply Payout Policies
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayoutSettings;






