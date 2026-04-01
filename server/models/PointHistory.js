import mongoose from "mongoose";

const pointHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    event: { type: String, required: true }, // registration, login, etc.
    description: { type: String },
    balanceAfter: { type: Number }
}, { timestamps: true });

const PointHistory = mongoose.model('PointHistory', pointHistorySchema);

export default PointHistory;
