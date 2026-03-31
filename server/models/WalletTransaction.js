import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'success'
    },
    source: {
        type: String,
        enum: ['wallet_deposit', 'course_purchase', 'instructor_earnings', 'admin_commission', 'withdrawal', 'refund'],
        required: true
    },
    description: {
        type: String
    },
    metadata: {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
        withdrawalId: { type: String }
    }
}, { timestamps: true });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
