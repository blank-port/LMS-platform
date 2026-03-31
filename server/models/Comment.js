import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    targetType: { type: String, enum: ['Course', 'Blog', 'Topic'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // For replies
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
