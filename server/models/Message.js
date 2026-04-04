import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    isRead: { type: Boolean, default: false },
    targetType: { type: String, enum: ['private', 'course', 'global'], default: 'private' },
    targetId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

// Institutional Integrity: Strategic Indexing for High-Performance Relays
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
