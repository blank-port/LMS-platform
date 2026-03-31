import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['technical', 'billing', 'content', 'other', 'Course Issue', 'Payment Issue', 'Technical', 'Other'], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    replies: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            message: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
