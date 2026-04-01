import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    lessonId: { type: String, default: null }, // Optional scope for specific lectures
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', default: null }, // Replies
    isReplied: { type: Boolean, default: false },
    isReserved: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'closed', 'hidden'], default: 'active' }
}, { timestamps: true });

// Institutional Integrity: Strategic Indexing for High-Performance Inquiries
discussionSchema.index({ courseId: 1, lessonId: 1, parentId: 1 });
discussionSchema.index({ userId: 1 });
discussionSchema.index({ createdAt: -1 });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
