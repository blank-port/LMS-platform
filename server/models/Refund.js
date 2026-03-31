import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['requested', 'approved', 'rejected', 'completed'], default: 'requested' },
    adminComment: { type: String }
}, { timestamps: true });

const Refund = mongoose.model('Refund', refundSchema);
export default Refund;
