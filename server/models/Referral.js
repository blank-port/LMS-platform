import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCode: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    rewardDetails: { type: String }
}, { timestamps: true });

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
