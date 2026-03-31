import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, Banknote, ShieldCheck, X } from 'lucide-react';

const Wallet = () => {
    const { backendUrl, token, user, fetchUserData } = useContext(AppContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (token) {
            fetchTransactions();
        }
    }, [token]);

    const fetchTransactions = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/wallet/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            toast.error('Failed to load transaction history');
        }
        setLoading(false);
    };

    const handleAddBalance = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            return toast.error('Enter a valid amount');
        }
        if (!paymentMethod) {
            return toast.error('Select a payment method');
        }

        setProcessing(true);
        // Simulate Payment Gateway Delay
        setTimeout(async () => {
            try {
                const { data } = await axios.post(`${backendUrl}/api/wallet/deposit`, {
                    amount: parseFloat(amount),
                    paymentMethod,
                    transactionId: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (data.success) {
                    toast.success('Funds added successfully!');
                    setShowAddModal(false);
                    setAmount('');
                    fetchUserData();
                    fetchTransactions();
                }
            } catch (error) {
                toast.error('Payment simulation failed');
            }
            setProcessing(false);
        }, 2000);
    };

    if (loading) return <div className="p-20 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest animate-pulse transition-all">Synchronizing Fiscal Ledger...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Treasury</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your course credits and transactions</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                >
                    + Supplement Balance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-[#0C132B] to-[#16213e] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                    <div className="relative z-10">
                        <WalletIcon size={32} className="text-indigo-400 mb-8" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Credit Liquidity</p>
                        <h2 className="text-5xl font-black tracking-tighter mb-4">₹{user?.walletBalance?.toLocaleString() || 0}</h2>
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} /> Secure Account
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50 flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Audited Transactions</h3>
                    <div className="space-y-6 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="text-center py-20 text-gray-300 italic text-sm">No fiscal movements recorded yet.</div>
                        ) : (
                            transactions.map((txn, i) => (
                                <div key={txn._id} className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50/50 border border-gray-50 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                            txn.amount > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                                        }`}>
                                            {txn.amount > 0 ? <ArrowDownLeft /> : <ArrowUpRight />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 tracking-tight">{txn.description || 'System Update'}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                {new Date(txn.createdAt).toLocaleString()} • {txn.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black tracking-tight ${txn.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">Confirmed</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Razorpay-like Payment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 transition-all">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 relative">
                        <button 
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-8 right-8 text-gray-300 hover:text-rose-500 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Modal Header */}
                        <div className="bg-[#0C132B] p-10 text-white flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Checkout Simulation</h4>
                                <h3 className="text-2xl font-black tracking-tighter">Prism<span className="text-indigo-400">Ed</span> Merchant</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Total Due</p>
                                <p className="text-xl font-black">₹{amount || '0'}</p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-12 space-y-10">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Enter Supplement Amount</label>
                                <div className="flex items-center gap-4 bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 focus-within:ring-4 ring-indigo-500/5 transition-all">
                                    <span className="text-2xl font-black text-gray-300 italic">₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="Min 100" 
                                        className="bg-transparent border-none outline-none text-2xl font-black text-gray-900 w-full placeholder:text-gray-200"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-6 px-1">Preferred Protocol</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'upi', name: 'Instant UPI', icon: <Smartphone />, desc: 'GPay, PhonePe, Paytm' },
                                        { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard />, desc: 'VISA, Mastercard, RuPay' },
                                        { id: 'netbanking', name: 'Internet Banking', icon: <Banknote />, desc: 'All Major Indian Banks' }
                                    ].map((method) => (
                                        <button 
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
                                                paymentMethod === method.id 
                                                ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/5' 
                                                : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-100'
                                            }`}
                                        >
                                            <div className={`p-4 rounded-xl ${paymentMethod === method.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-gray-400'}`}>
                                                {method.icon}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === method.id ? 'text-indigo-600' : 'text-gray-900'}`}>{method.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">{method.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddBalance}
                                disabled={processing || !amount || parseFloat(amount) <= 0}
                                className={`w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl relative overflow-hidden group ${
                                    processing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0C132B] text-white hover:bg-indigo-600 shadow-indigo-500/10'
                                }`}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-4">
                                        <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                                        Synchronizing Nodes...
                                    </span>
                                ) : (
                                    `Authorize Transaction: ₹${amount || '0'}`
                                )}
                            </button>

                            <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldCheck size={12} className="text-indigo-200" /> Powered by Standardized Fiscal Protocols
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
