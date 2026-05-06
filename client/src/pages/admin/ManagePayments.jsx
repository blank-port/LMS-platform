import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    CheckCircleIcon, 
    ShieldCheckIcon, 
    CreditCardIcon, 
    BanknotesIcon, 
    DocumentTextIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ManagePayments = ({ title, method }) => {
    const { backendUrl, token, currency, fetchAllSettings, updateBatchSettings } = useContext(AppContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'config'
    
    // Configuration State
    const [configs, setConfigs] = useState({});
    const [configLoading, setConfigLoading] = useState(false);

    useEffect(() => {
        if (view === 'list') {
            fetchPendingPayments();
        } else {
            loadConfigData();
        }
    }, [view, method]);

    const fetchPendingPayments = async () => {
        setLoading(true);
        try {
            const methodMap = {
                'online': 'razorpay',
                'offline': 'cod',
                'bank': 'bank_transfer'
            };
            const backendMethod = methodMap[method] || method || 'all';
            const { data } = await api.get(`/payment/pending?method=${backendMethod}`);
            if (data.success) {
                setPayments(data.payments);
                if (data.payments.length === 0) setView('config');
            }
        } catch (error) {
            toast.error("Fiscal Intelligence Retrieval Failure");
        }
        setLoading(false);
    };

    const loadConfigData = async () => {
        setLoading(true);
        const data = await fetchAllSettings();
        if (data && data.length > 0) {
            const settingsMap = {};
            data.forEach(s => settingsMap[s.key] = s.value);
            setConfigs(settingsMap);
        }
        setLoading(false);
    };

    const handleApprove = async (paymentId) => {
        const actionToast = toast.loading('Authorizing Fiscal Transaction...');
        try {
            const { data } = await api.post('/payment/approve-cod', { paymentId });
            if (data.success) {
                toast.update(actionToast, { render: 'Transaction authorized.', type: "success", isLoading: false, autoClose: 3000 });
                fetchPendingPayments();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Transaction authorization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleConfigChange = (key, value) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    const saveConfigs = async () => {
        setConfigLoading(true);
        const success = await updateBatchSettings(configs);
        if (success) {
            toast.success("Strategic Architecture Recalibrated");
        }
        setConfigLoading(false);
    };

    if (loading && payments.length === 0 && Object.keys(configs).length === 0) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Fiscal Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[var(--border)] pb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{title || "Fiscal Transaction Authorization"}</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">
                        {method === 'razorpay' ? 'Digital Gateway Oversight' : 
                         method === 'bank_transfer' ? 'Bank Asset Verification' : 
                         'Offline Request Orchestration'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)] shadow-inner">
                    <button 
                        onClick={() => setView('list')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Pending Protocols
                    </button>
                    <button 
                        onClick={() => setView('config')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'config' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Architecture Config
                    </button>
                </div>
            </div>

            {view === 'list' ? (
                <div className="bg-[var(--surface)] rounded-[3.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Authorization Queue</h3>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">{payments.length} PENDING PROTOCOLS</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--background)]/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Scholar Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Curriculum Asset</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Gross Amount</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Request Date</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Protocol Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-24 text-center">
                                            <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 rotate-12">💳</div>
                                            <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Fiscal Queue Neutral</h3>
                                            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No pending authorization protocols detected.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[1rem] bg-gray-900 text-white flex items-center justify-center text-[11px] font-black group-hover:bg-purple-600 transition-colors">
                                                        {payment.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[var(--text-main)] text-sm tracking-tight capitalize">{payment.user?.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 italic lowercase tracking-wider">{payment.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">{payment.course?.courseTitle}</p>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-lg font-black text-[var(--text-main)] font-mono tracking-tighter">{currency}{payment.amount}</span>
                                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">Gross Value</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button 
                                                    onClick={() => handleApprove(payment._id)}
                                                    className="h-12 px-8 bg-[var(--background)] text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-600 hover:text-white hover:shadow-xl hover:shadow-purple-200 transition-all border border-[var(--border)]"
                                                >
                                                    Authorize Protocol
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Configuration View */
                <div className="space-y-10">
                    {/* Method Description Card */}
                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheckIcon className="w-40 h-40" />
                        </div>
                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight mb-4 flex items-center gap-3">
                            <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                            Strategic Fiscal Architecture
                        </h3>
                        <p className="text-sm font-bold text-gray-500 max-w-2xl leading-relaxed uppercase tracking-wider text-[11px]">
                            Configure institutional parameters for automated and manual value capture. Changes here recalibrate the primary checkout protocols for all curriculum assets.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {/* Online Gateways: Razorpay, Stripe, & PayPal */}
                        {(method === 'all' || method === 'online') && (
                            <div className="space-y-10">
                                {/* Razorpay Card */}
                                <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400">
                                                <CreditCardIcon className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Razorpay Digital Architecture</h4>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={configs.razorpay_active === 'true' || configs.razorpay_active === true} 
                                            onChange={(e) => handleConfigChange('razorpay_active', e.target.checked)}
                                            className="w-6 h-6 rounded-lg accent-purple-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Key ID</label>
                                            <input 
                                                type="text" 
                                                value={configs.razorpay_key_id || ''} 
                                                onChange={(e) => handleConfigChange('razorpay_key_id', e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none placeholder:text-gray-700 font-mono"
                                                placeholder="rzp_test_..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Key Secret</label>
                                            <input 
                                                type="password" 
                                                value={configs.razorpay_key_secret || ''} 
                                                onChange={(e) => handleConfigChange('razorpay_key_secret', e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none placeholder:text-gray-700 font-mono tracking-widest"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stripe Card */}
                                <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-400">
                                                <CreditCardIcon className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Stripe Global Architecture</h4>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={configs.stripe_active === 'true' || configs.stripe_active === true} 
                                            onChange={(e) => handleConfigChange('stripe_active', e.target.checked)}
                                            className="w-6 h-6 rounded-lg accent-blue-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Publishable Key</label>
                                            <input 
                                                type="text" 
                                                value={configs.stripe_key || ''} 
                                                onChange={(e) => handleConfigChange('stripe_key', e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none placeholder:text-gray-700 font-mono"
                                                placeholder="pk_test_..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Secret Key</label>
                                            <input 
                                                type="password" 
                                                value={configs.stripe_secret || ''} 
                                                onChange={(e) => handleConfigChange('stripe_secret', e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none placeholder:text-gray-700 font-mono tracking-widest"
                                                placeholder="sk_test_..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* PayPal Card */}
                                <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400">
                                                <CreditCardIcon className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">PayPal Digital Architecture</h4>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={configs.paypal_active === 'true' || configs.paypal_active === true} 
                                            onChange={(e) => handleConfigChange('paypal_active', e.target.checked)}
                                            className="w-6 h-6 rounded-lg accent-indigo-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Client ID</label>
                                            <input 
                                                type="text" 
                                                value={configs.paypal_client_id || ''} 
                                                onChange={(e) => handleConfigChange('paypal_client_id', e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none placeholder:text-gray-700 font-mono"
                                                placeholder="Ac..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Secret</label>
                                            <input 
                                                type="password" 
                                                value={configs.paypal_client_secret || ''} 
                                                onChange={(e) => handleConfigChange('paypal_client_secret', e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none placeholder:text-gray-700 font-mono tracking-widest"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Offline, Bank, & Global Parameters */}
                        {(method === 'all' || method === 'offline' || method === 'bank') && (
                            <div className="space-y-10">
                                {/* Global Fiscal Parameters (Revenue Split & Commission) */}
                                {method === 'all' && (
                                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                                            <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center text-red-400">
                                                <BanknotesIcon className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Global Revenue Protocols</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Commission Percentage (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={configs.global_commission_percentage || 20} 
                                                    onChange={(e) => handleConfigChange('global_commission_percentage', e.target.value)}
                                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Tax Deduction Percentage (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={configs.tax_deduction_percentage || 0} 
                                                    onChange={(e) => handleConfigChange('tax_deduction_percentage', e.target.value)}
                                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm font-black text-white outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Offline Card */}
                                {(method === 'all' || method === 'offline') && (
                                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-400">
                                                    <DocumentTextIcon className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Offline Collection Directives</h4>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={configs.offline_payment_active === 'true' || configs.offline_payment_active === true} 
                                                onChange={(e) => handleConfigChange('offline_payment_active', e.target.checked)}
                                                className="w-6 h-6 rounded-lg accent-orange-600"
                                            />
                                        </div>
                                        <textarea 
                                            value={configs.offline_payment_instructions || ''} 
                                            onChange={(e) => handleConfigChange('offline_payment_instructions', e.target.value)}
                                            rows={4}
                                            className="w-full px-8 py-6 rounded-[2rem] bg-[var(--background)] border border-[var(--border)] text-sm font-bold text-gray-300 outline-none resize-none"
                                            placeholder="Directives for physical payment collection..."
                                        />
                                    </div>
                                )}

                                {/* Bank Card */}
                                {(method === 'all' || method === 'bank') && (
                                    <div className="bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--border)] space-y-8">
                                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-green-900/20 rounded-xl flex items-center justify-center text-green-400">
                                                    <BanknotesIcon className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Bank Asset Architecture</h4>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={configs.bank_payment_active === 'true' || configs.bank_payment_active === true} 
                                                onChange={(e) => handleConfigChange('bank_payment_active', e.target.checked)}
                                                className="w-6 h-6 rounded-lg accent-green-600"
                                            />
                                        </div>
                                        <textarea 
                                            value={configs.bank_payment_instructions || ''} 
                                            onChange={(e) => handleConfigChange('bank_payment_instructions', e.target.value)}
                                            rows={4}
                                            className="w-full px-8 py-6 rounded-[2rem] bg-[var(--background)] border border-[var(--border)] text-sm font-bold text-gray-300 outline-none resize-none"
                                            placeholder="Bank Account, IFSC, and wire transfer protocols..."
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex justify-end pt-6">
                        <button 
                            onClick={saveConfigs}
                            disabled={configLoading}
                            className="h-16 px-12 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-600 transition-all shadow-2xl relative overflow-hidden disabled:opacity-50"
                        >
                            <span className="relative z-10">{configLoading ? 'Persisting Protocols...' : '💾 Persist Configuration'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePayments;






