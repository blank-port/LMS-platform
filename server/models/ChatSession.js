import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for guest shoppers
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    messages: [
        {
            role: { type: String, enum: ['user', 'bot'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    context: {
        lastCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        mode: { type: String, enum: ['mentor', 'sales', 'support'], default: 'sales' }
    }
}, { timestamps: true });

chatSessionSchema.index({ userId: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
