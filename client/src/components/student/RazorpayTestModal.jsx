import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ShieldCheck, CheckCircle2, QrCode, Zap, Smartphone, Sparkles } from 'lucide-react';

const RazorpayTestModal = ({ isOpen, onClose, course, onPaymentSuccess, companyName = "PrismEd" }) => {
    const [step, setStep] = useState('qr'); // 'qr', 'processing', 'success'

    const finalPrice = (course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2);

    useEffect(() => {
        if (isOpen) setStep('qr');
    }, [isOpen]);

    const handleContinue = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
            }, 1800);
        }, 2200);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-slate-950/60 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-[420px] h-full md:h-auto md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/20"
            >
                {/* Protocol Header */}
                <div className="bg-[#EF233C] px-8 py-7 text-white flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-5 relative z-10">
                        <button onClick={onClose} className="hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90">
                            <ArrowLeft size={20} strokeWidth={3} />
                        </button>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">Payment Portal</p>
                            <h2 className="text-xl font-black tracking-tight">{companyName}</h2>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-white/10 relative z-10">
                        {companyName.charAt(0)}
                    </div>
                </div>

                <div className="flex-grow bg-[#FDFDFD] relative">
                    <AnimatePresence mode="wait">
                        {step === 'qr' && (
                            <motion.div 
                                key="qr"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 pb-12"
                            >
                                {/* Offer Banner */}
                                <div className="p-4 bg-rose-50/50 rounded-3xl border border-rose-100 mb-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                                            <Sparkles size={16} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Active Reward</p>
                                            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">5% Cashback on UPI</p>
                                        </div>
                                    </div>
                                    <span className="text-rose-200">›</span>
                                </div>

                                {/* QR Matrix */}
                                <div className="text-center px-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Neural Scan Authorization</p>
                                    <div className="relative inline-block group">
                                        <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500/10 to-transparent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50 relative z-10 ring-1 ring-gray-100 hover:ring-[#EF233C]/20 transition-all">
                                            <QrCode size={140} className="text-gray-300 opacity-40 mx-auto" strokeWidth={1} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white shadow-xl rounded-xl border border-gray-100 flex items-center justify-center">
                                                    <Smartphone size={20} className="text-[#EF233C]" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Dynamic Pulse */}
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-50 z-20">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-4 bg-gray-50 rounded-md border border-gray-100"></div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-14 flex items-center justify-center gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Secure Handshake Latched</p>
                                    </div>
                                </div>

                                {/* Preferences Area */}
                                <div className="mt-10 pt-10 border-t border-gray-50 space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Legacy Integrations</h3>
                                    {[
                                        { id: 'upi', label: 'UPI Protocol', sub: 'Instant Authorization', icon: Zap },
                                        { id: 'cards', label: 'Fiscal Cards', sub: 'Visa, Master, RuPay', icon: ShieldCheck },
                                    ].map((opt) => (
                                        <div 
                                            key={opt.id}
                                            className="flex items-center justify-between p-5 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-50 group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                                                    <opt.icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 tracking-tight">{opt.label}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{opt.sub}</p>
                                                </div>
                                            </div>
                                            <span className="text-2xl text-gray-100 group-hover:text-gray-300 transition-colors">›</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div 
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full min-h-[450px] flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-rose-100 rounded-full absolute inset-0"></div>
                                    <div className="w-24 h-24 border-4 border-[#EF233C] border-t-transparent rounded-full animate-spin shadow-xl shadow-rose-500/20"></div>
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight mt-10">Synchronizing Vault...</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-4 leading-relaxed max-w-[200px] mx-auto">
                                    Authenticating transaction tunnel. Do not oscillate.
                                </p>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full min-h-[450px] flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-emerald-500/30 animate-in zoom-in spin-in-12 duration-700">
                                    <CheckCircle2 size={48} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-3xl font-black text-[#0C132B] tracking-tight mt-10">Protocol Mastered!</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-4">Fiscal Assets successfully deployed.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Secure Sticky Footer */}
                {step === 'qr' && (
                    <div className="p-8 bg-white border-t border-gray-50 flex items-center justify-between shadow-[0_-20px_40px_rgba(0,0,0,0.03)] relative z-20">
                        <div>
                            <p className="text-3xl font-black text-[#0C132B] tracking-tighter">₹{finalPrice}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                                Institutional Fee <span className="opacity-30">⌄</span>
                            </p>
                        </div>
                        <button 
                            onClick={handleContinue}
                            className="bg-[#0C132B] text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-[#EF233C] transition-all shadow-xl shadow-black/10 active:scale-95 group overflow-hidden relative"
                        >
                            <span className="relative z-10">Continue Journey</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default RazorpayTestModal;
