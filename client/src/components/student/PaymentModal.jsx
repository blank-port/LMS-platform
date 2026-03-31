import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import RazorpayTestModal from './RazorpayTestModal.jsx';

const PaymentModal = ({ isOpen, onClose, course, onPaymentSuccess }) => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [method, setMethod] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    const handlePayment = async () => {
        if (method === 'test_razorpay') {
            setShowTestModal(true);
            return;
        }

        setLoading(true);
        try {
            if (method === 'razorpay') {
                // Initialize Razorpay
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
                    name: "LMS Platform",
                    description: `Course: ${course.courseTitle}`,
                    order_id: orderData.order.id,
                    handler: async (response) => {
                        try {
                            const { data: verifyData } = await axios.post(`${backendUrl}/api/payment/verify-payment`, {
                                ...response,
                                courseId: course._id
                            }, { headers: { Authorization: `Bearer ${token}` } });

                            if (verifyData.success) {
                                toast.success("Payment Successful!");
                                onPaymentSuccess();
                                onClose();
                            }
                        } catch (err) {
                            toast.error("Payment Verification Failed");
                        }
                    },
                    modal: { ondismiss: () => setLoading(false) }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else if (method === 'cod') {
                const { data } = await axios.post(`${backendUrl}/api/payment/request-cod`, { courseId: course._id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    toast.success("COD Request Submitted! Awaiting Admin Approval.");
                    onClose();
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message || "Payment Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const finalPrice = (course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <div className="p-6">
                    <div className="mb-6 flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                        <img src={course.courseThumbnail} className="w-16 h-12 object-cover rounded-lg" alt="" />
                        <div>
                            <p className="text-sm font-semibold truncate max-w-[200px]">{course.courseTitle}</p>
                            <p className="text-xs text-blue-600 font-bold">{currency}{finalPrice}</p>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Select Payment Method</h3>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => setMethod('razorpay')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'razorpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💳</span>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">Razorpay</p>
                                    <p className="text-xs text-gray-500">Pay securely via Cards, UPI, Netbanking</p>
                                </div>
                            </div>
                            {method === 'razorpay' && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                        </button>

                        <button 
                            onClick={() => setMethod('test_razorpay')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'test_razorpay' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🧪</span>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">Razorpay (Test)</p>
                                    <p className="text-xs text-gray-500">Realistic test payment experience</p>
                                </div>
                            </div>
                            {method === 'test_razorpay' && <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                        </button>

                        <button 
                            onClick={() => setMethod('cod')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🚚</span>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">Cash on Delivery</p>
                                    <p className="text-xs text-gray-500">Manual approval after payment confirmation</p>
                                </div>
                            </div>
                            {method === 'cod' && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                        </button>
                    </div>

                    <RazorpayTestModal 
                        isOpen={showTestModal} 
                        onClose={() => setShowTestModal(false)}
                        course={course}
                        companyName="PrismEd"
                        onPaymentSuccess={async () => {
                            try {
                                const { data } = await axios.post(`${backendUrl}/api/course/enroll`, { courseId: course._id }, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (data.success) {
                                    toast.success("Enrollment Successful!");
                                    onPaymentSuccess();
                                    onClose();
                                }
                            } catch (e) {
                                toast.error("Test Enrollment Failed");
                            }
                        }}
                    />

                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                        ) : (
                            `Pay ${currency}${finalPrice}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
