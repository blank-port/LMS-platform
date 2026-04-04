import mongoose from "mongoose";

const deviceSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: String, required: true }, // e.g., Windows, iPhone
    browser: { type: String, required: true }, // e.g., Chrome, Safari
    ip: { type: String },
    location: { type: String, default: 'Unknown' },
    lastActive: { type: Date, default: Date.now },
    isCurrent: { type: Boolean, default: false }
}, { timestamps: true });

const DeviceSession = mongoose.model('DeviceSession', deviceSessionSchema);
export default DeviceSession;
