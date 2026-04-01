import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    targetType: { type: String, enum: ['Course', 'Blog', 'Topic'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // For replies
    status: { type: String, enum: ['pending', 'approved', 'spam'], default: 'approved' }, // Default to approved for internal UX, admins can toggle.
}, { timestamps: true });

// Institutional Integrity: Strategic Indexing for High-Performance Discourse
commentSchema.index({ targetId: 1, status: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
