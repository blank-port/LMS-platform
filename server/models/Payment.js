import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, enum: ['razorpay', 'cod', 'bank'], default: 'razorpay' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'cod_pending', 'pending_approval', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    receiptUrl: { type: String },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
