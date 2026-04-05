import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ShieldCheck, CheckCircle2, Zap, Smartphone, Sparkles, CreditCard, ChevronRight } from 'lucide-react';
import { assets } from '../../assets/assets';

const RazorpayTestModal = ({ isOpen, onClose, course, onPaymentSuccess, companyName = "PrismEd" }) => {
    const [step, setStep] = useState('qr'); // 'qr', 'processing', 'success'

    const basePrice = Number(course.coursePrice || 0);
    const discountAmount = basePrice * (Number(course.discount || 0) / 100);
    const finalPrice = (basePrice - discountAmount).toFixed(2);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0C132B]/80 backdrop-blur-2xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-[850px] max-h-[90vh] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative border border-white/20"
            >
                {/* Header Strip */}
                <div className="bg-[#EF233C] px-12 py-6 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
                    <div className="flex items-center gap-6 relative z-10">
                        <button onClick={onClose} className="hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-95">
                            <ArrowLeft size={22} strokeWidth={3} />
                        </button>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Encryption Protocol Active</p>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                {companyName} Secure <ShieldCheck size={20} className="fill-white/20" />
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                         <div className="text-right mr-4 hidden md:block">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Session ID</p>
                            <p className="text-[11px] font-mono font-bold tracking-tighter">TRANS-X-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                         </div>
                         <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center font-black text-3xl shadow-inner border border-white/20">
                            {companyName.charAt(0)}
                        </div>
                    </div>
                </div>

                {/* Main Body: 2 Columns */}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-[#FDFDFD]">
                    
                    {/* Left Column: Order Analysis */}
                    <div className="w-full md:w-[40%] bg-gray-50/50 border-r border-gray-100 p-10 flex flex-col justify-between overflow-y-auto">
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6">Asset Summary</h3>
                                <div className="flex gap-5 items-start">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white shadow-xl flex-shrink-0 bg-white">
                                        <img src={course.courseThumbnail || assets.course_1_thumbnail} alt="Module" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-[#0C132B] leading-tight mb-2">{course.courseTitle}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Curriculum Node</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Fiscal Breakdown</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-400">Base Contribution</span>
                                        <span className="font-black text-[#0C132B]">₹{basePrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-emerald-500">Scholarship Applied</span>
                                        <span className="font-black text-emerald-500">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200/60 flex justify-between items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1">Final Liability</span>
                                        <span className="text-4xl font-black text-[#EF233C] tracking-tighter">₹{finalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <Sparkles className="text-rose-500 shrink-0 mt-1" size={18} />
                            <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                                This transaction is protected under the 128-bit <span className="text-[#0C132B] font-black italic">PrismShield</span> verification protocol.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Authorization Matrix */}
                    <div className="flex-grow p-10 overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                            {step === 'qr' && (
                                <motion.div 
                                    key="qr"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="text-center space-y-8">
                                        <div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Secure Scan Corridor</p>
                                            <h4 className="text-xl font-black text-[#0C132B] tracking-tight">Direct UPI Authorization</h4>
                                        </div>

                                        <div className="relative inline-block group mx-auto">
                                            <div className="absolute -inset-6 bg-gradient-to-tr from-[#EF233C]/20 to-transparent rounded-[3.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                            <div className="bg-white p-6 rounded-[3.5rem] shadow-2xl border-4 border-gray-50 relative z-10 w-[240px] aspect-square overflow-hidden hover:scale-105 transition-all duration-500">
                                                {/* GPay QR Image */}
                                                <img 
                                                    src={assets.gpay_qr} 
                                                    alt="Scan to Pay" 
                                                    className="w-full h-full object-contain rounded-[2rem]"
                                                    onError={(e) => { e.target.src = "https://placehold.co/400x400?text=SCAN+TO+PAY"; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
                                            </div>
                                            
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0C132B] text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl z-20 whitespace-nowrap">
                                                <Smartphone size={12} /> Live Scan Active
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-4 pt-6">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Institutional Handshake Ready</p>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-gray-100 space-y-6">
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Secondary Channels</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'UPI Direct', icon: Zap, color: 'text-rose-500' },
                                                { label: 'Bank Bridge', icon: CreditCard, color: 'text-blue-500' }
                                            ].map((btn) => (
                                                <button key={btn.label} className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-xl hover:scale-102 transition-all active:scale-95 group">
                                                    <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center ${btn.color} group-hover:bg-rose-50 transition-colors`}>
                                                        <btn.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{btn.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'processing' && (
                                <motion.div 
                                    key="processing"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="relative mb-12">
                                        <div className="w-32 h-32 border-4 border-[#EF233C1A] rounded-[3rem] absolute inset-0"></div>
                                        <div className="w-32 h-32 border-4 border-[#EF233C] border-t-transparent rounded-[3rem] animate-spin shadow-2xl shadow-rose-500/20"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap size={32} className="text-[#EF233C] animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#0C132B] tracking-tight">Syncing Ledger...</h3>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.35em] mt-6 leading-relaxed max-w-[280px]">
                                        Mapping transaction hash to institutional database. Do not reload.
                                    </p>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="w-32 h-32 bg-emerald-500 rounded-[3.5rem] flex items-center justify-center text-white text-5xl shadow-2xl shadow-emerald-500/30 animate-in zoom-in spin-in-12 duration-1000">
                                        <CheckCircle2 size={64} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-4xl font-black text-[#0C132B] tracking-tight mt-12">Handshake Finalized!</h3>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-6">Fiscal Assets fully deployed to curriculum node.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Modal Footer Area */}
                <div className="bg-white border-t border-gray-100 p-10 flex items-center justify-between relative z-30 flex-shrink-0 shadow-[0_-20px_60px_rgba(0,0,0,0.04)] px-16">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-rose-500">
                             <Sparkles size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#EF233C] uppercase tracking-widest mb-1 italic">Flash Unlock Active</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Instant Curriculum Provisioning</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <button onClick={onClose} className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0C132B] transition-colors pr-4">
                            Cancel
                        </button>
                        <button 
                            onClick={handleContinue}
                            disabled={step !== 'qr'}
                            className="h-20 px-16 bg-[#0C132B] text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-[#EF233C] hover:shadow-2xl hover:shadow-[#EF233C]/20 transition-all flex items-center gap-6 relative group overflow-hidden active:scale-95 disabled:opacity-30"
                        >
                            <span className="relative z-10">Confirm Allocation</span>
                            <ChevronRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RazorpayTestModal;
