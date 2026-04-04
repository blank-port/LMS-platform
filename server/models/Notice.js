import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional: All students or specific course
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: { type: String, enum: ['all', 'course'], default: 'all' },
    priority: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
    expiryDate: { type: Date },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
