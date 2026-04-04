import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CheckCircle2, CreditCard, Ship, Truck, X, Loader2 } from 'lucide-react';
import RazorpayTestModal from './RazorpayTestModal.jsx';

const PaymentModal = ({ isOpen, onClose, course, onPaymentSuccess }) => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [method, setMethod] = useState('razorpay');
    const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'success'
    const [showTestModal, setShowTestModal] = useState(false);

    const finalPrice = (course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2);

    useEffect(() => {
        if (!isOpen) {
            setStatus('idle');
            setShowTestModal(false);
        }
    }, [isOpen]);

    const handlePayment = async () => {
        if (method === 'test_razorpay') {
            setShowTestModal(true);
            return;
        }

        setStatus('preparing');
        
        // Artificial delay for cinematic transition/perception of security
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (method === 'razorpay') {
                const { data: orderData } = await axios.post(`${backendUrl}/api/payment/create-order`, { courseId: course._id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!orderData.success) throw new Error(orderData.message);

                const { data: settingsData } = await axios.get(`${backendUrl}/api/setting/public`);
                const RAZORPAY_KEY_ID = settingsData.settings.razorpay_key_id;

                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.order.amount,
                    currency: orderData.order.currency,
                    name: "PrismEd LMS",
                    description: `Neural Sync: ${course.courseTitle}`,
                    order_id: orderData.order.id,
                    theme: { color: "#2563eb" },
                    handler: async (response) => {
                        setStatus('preparing');
                        try {
                            const { data: verifyData } = await axios.post(`${backendUrl}/api/payment/verify-payment`, {
                                ...response,
                                courseId: course._id
                            }, { headers: { Authorization: `Bearer ${token}` } });

                            if (verifyData.success) {
                                setStatus('success');
                                onPaymentSuccess();
                                toast.success("Strategic assets expanded.");
                            }
                        } catch (err) {
                            toast.error("Handshake Verification Failed");
                            setStatus('idle');
                        }
                    },
                    modal: { ondismiss: () => setStatus('idle') }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else if (method === 'cod') {
                const { data } = await axios.post(`${backendUrl}/api/payment/request-cod`, { courseId: course._id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    toast.success("COD Request Latched. Pending institutional approval.");
                    onClose();
                } else {
                    toast.error(data.message);
                    setStatus('idle');
                }
            }
        } catch (error) {
            toast.error(error.message || "Gateway Protocol Error");
            setStatus('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[450px] p-10 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-xl shadow-emerald-100">
                            <CheckCircle2 size={48} strokeWidth={1.5} className="animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sync Mastered!</h2>
                        <p className="text-slate-500 font-medium mb-8">"{course.courseTitle}" is now active in your neural core.</p>
                        
                        <button 
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            Deploy to Course
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="checkout"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[480px] overflow-hidden relative"
                    >
                        {/* Header Section */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h2>
                                <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-blue-50 rounded-full text-blue-600">
                                    <Lock size={12} fill="currentColor" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-950 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Course Context Card */}
                            <div className="mb-8 flex items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <img src={course.courseThumbnail} className="w-20 h-16 object-cover rounded-2xl shadow-md rotate-[-2deg]" alt="" />
                                <div className="relative z-10">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Target Module</p>
                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{course.courseTitle}</p>
                                    <p className="text-xl font-black text-blue-600 tracking-tighter mt-1">{currency}{finalPrice}</p>
                                </div>
                            </div>

                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 pl-1">Payment Infrastructure</h3>
                            
                            {/* Methods Matrix */}
                            <div className="space-y-4">
                                {[
                                    { id: 'razorpay', icon: CreditCard, label: 'Digital Matrix', sub: 'UPI, Cards, Netbanking', color: 'blue' },
                                    { id: 'test_razorpay', icon: Ship, label: 'Sandbox Simulation', sub: 'Risk-free protocol verification', color: 'indigo' },
                                    { id: 'cod', icon: Truck, label: 'Manual Latch', sub: 'Institutional cash processing', color: 'slate' }
                                ].map((opt) => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => setMethod(opt.id)}
                                        className={`w-full group text-left flex items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300 active:scale-[0.98] ${
                                            method === opt.id 
                                            ? `border-${opt.color}-600 bg-${opt.color}-50 shadow-lg shadow-${opt.color}-100` 
                                            : 'border-slate-50 bg-white hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`p-3 rounded-2xl transition-colors ${
                                                method === opt.id ? `bg-${opt.color}-600 text-white` : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                <opt.icon size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className={`font-bold tracking-tight text-sm ${method === opt.id ? 'text-slate-900' : 'text-slate-600'}`}>{opt.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{opt.sub}</p>
                                            </div>
                                        </div>
                                        {method === opt.id && (
                                            <motion.div 
                                                layoutId="selected-indicator"
                                                className={`w-6 h-6 bg-${opt.color}-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-${opt.color}-200`}
                                            >
                                                <CheckCircle2 size={14} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Verification Buffer */}
                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">100% Secure Interface</span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-5 bg-slate-50 rounded-lg border border-slate-200"></div>)}
                                </div>
                            </div>

                            {/* Prime Button */}
                            <button 
                                onClick={handlePayment}
                                disabled={status === 'preparing'}
                                className={`w-full py-5 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden flex items-center justify-center gap-3 ${
                                    status === 'preparing' 
                                    ? 'bg-slate-100 text-slate-400 pointer-events-none' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-200 hover:shadow-blue-400 hover:scale-[1.02] active:scale-95'
                                }`}
                            >
                                {status === 'preparing' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                        <span>Securing Protocol...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Initiate Journey</span>
                                        <div className="flex items-center text-white/50 tracking-tighter">
                                            <span>{currency}</span>
                                            <span>{finalPrice}</span>
                                        </div>
                                    </>
                                )}
                                {status !== 'preparing' && (
                                    <motion.div 
                                        initial={false}
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 skew-x-[-20deg]"
                                    />
                                )}
                            </button>
                            
                            <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest mt-6">
                                Professional Institutional Payment Gateway Verified
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RazorpayTestModal 
                isOpen={showTestModal} 
                onClose={() => {
                    setShowTestModal(false);
                    setStatus('idle');
                }}
                course={course}
                companyName="PrismEd"
                onPaymentSuccess={async () => {
                    setStatus('preparing');
                    try {
                        const { data } = await axios.post(`${backendUrl}/api/course/enroll`, { courseId: course._id }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (data.success) {
                            setStatus('success');
                            onPaymentSuccess();
                        }
                    } catch (e) {
                        toast.error("Handshake Desync");
                        setStatus('idle');
                    }
                }}
            />
        </div>
    );
};

export default PaymentModal;
