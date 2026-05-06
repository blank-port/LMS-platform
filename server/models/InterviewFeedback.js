import mongoose from 'mongoose';

const interviewFeedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    transcript: { type: String, required: true }, // Full conversation log
    overallScore: { type: Number, required: true }, // 0-100
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    moduleTitle: { type: String }, // Which part of course was interviewed
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('InterviewFeedback', interviewFeedbackSchema);
