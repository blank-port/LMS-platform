import React, { useState, useEffect } from 'react';

const RazorpayTestModal = ({ isOpen, onClose, course, onPaymentSuccess, companyName = "PrismEd" }) => {
    const [step, setStep] = useState('qr'); // 'qr', 'processing', 'success'
    const [selectedUpi, setSelectedUpi] = useState('phonepe');

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
            }, 1500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[400px] h-full md:h-auto md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative border border-gray-100">
                
                {/* Razorpay Header Style */}
                <div className="bg-[#EF233C] p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </button>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Payment to</p>
                            <h2 className="text-lg font-black tracking-tight">{companyName}</h2>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-xl">
                        {companyName.charAt(0)}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto bg-[#F8F9FA]">
                    {step === 'qr' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            {/* Available Offers */}
                            <div className="p-4 bg-white m-4 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 text-lg">🏷️</div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Get upto 5% cashback on UPI</p>
                                </div>
                                <span className="text-xl text-gray-300">›</span>
                            </div>

                            {/* QR Section */}
                            <div className="px-6 py-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 text-center">Scan QR using any UPI App</p>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 mx-auto max-w-[240px] relative aspect-square flex items-center justify-center group">
                                    <div className="absolute inset-4 border-2 border-dashed border-gray-100 rounded-[2rem] group-hover:border-[#EF233C] transition-colors duration-500"></div>
                                    <img 
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TEST_PAYMENT" 
                                        alt="QR" 
                                        className="w-32 h-32 relative z-10 grayscale opacity-80"
                                    />
                                    <div className="absolute -bottom-4 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex gap-3">
                                        {['PhonePe', 'GPay', 'Paytm'].map((app, i) => (
                                            <div key={i} className="w-6 h-6 bg-gray-50 rounded-md border border-gray-200"></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-10 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Upto 5% cashback active</p>
                                </div>
                            </div>

                            {/* Payment Options */}
                            <div className="p-6 bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.02)] mt-8">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Preferred Payment Options</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'upi', label: 'UPI', sub: 'PhonePe, GPay, Paytm', icon: '⚡' },
                                        { id: 'cards', label: 'Cards', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                                    ].map((opt) => (
                                        <div 
                                            key={opt.id}
                                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-[#EF233C]/10 transition-colors">
                                                    {opt.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800 tracking-tight">{opt.label}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{opt.sub}</p>
                                                </div>
                                            </div>
                                            <span className="text-2xl text-gray-200 group-hover:text-gray-400 transition-colors">›</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] leading-relaxed">
                                        By proceeding, I agree to Razorpay's Privacy Notice<br/>
                                        <span className="text-[#EF233C]/40">Edit Preferences</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="h-full flex flex-col items-center justify-center p-12 animate-in fade-in duration-500">
                            <div className="w-20 h-20 border-4 border-[#EF233C] border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-rose-500/20"></div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight text-center">Protocol Synchronizing...</h3>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-4 text-center leading-relaxed">Securing fiscal transaction tunnel. Please do not close the window.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center p-12 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text- white text-4xl mb-8 shadow-2xl shadow-emerald-500/30 animate-bounce">
                                ✓
                            </div>
                            <h3 className="text-2xl font-black text-[#0C132B] tracking-tight text-center">Payment Mastered!</h3>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-4 text-center">Assets deployed to your legacy library.</p>
                        </div>
                    )}
                </div>

                {/* Footer Sticky */}
                {step === 'qr' && (
                    <div className="p-6 bg-white border-t border-gray-50 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                        <div>
                            <p className="text-2xl font-black text-[#0C132B] tracking-tighter">₹{finalPrice}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">View Details <span className="opacity-40">⌄</span></p>
                        </div>
                        <button 
                            onClick={handleContinue}
                            className="bg-[#0C132B] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#EF233C] transition-all shadow-xl shadow-black/10 active:scale-95"
                        >
                            Continue Journey
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RazorpayTestModal;
