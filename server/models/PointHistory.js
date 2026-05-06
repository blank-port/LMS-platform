import mongoose from "mongoose";

const pointHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    event: { type: String, required: true }, // registration, login, etc.
    description: { type: String },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    balanceAfter: { type: Number }
}, { timestamps: true });

// Prevent race-condition notification spam for itemized rewards
pointHistorySchema.index(
    { userId: 1, event: 1, referenceId: 1 },
    { unique: true, partialFilterExpression: { referenceId: { $exists: true } } }
);

const PointHistory = mongoose.model('PointHistory', pointHistorySchema);

export default PointHistory;
