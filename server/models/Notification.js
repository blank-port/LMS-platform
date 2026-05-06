import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: [
            'COD_ORDER', 'NEW_QUESTION', 'NEW_MESSAGE', 'REWARD_REDEMPTION', 'NEW_USER', 
            'PAYMENT_SUCCESS', 'PAYMENT_FAILURE', 'COURSE_REQUEST',
            'ENROLLMENT_CONFIRMED', 'REFUND_REPLY', 'ACHIEVEMENT_UNLOCKED', 
            'INSTITUTIONAL_NOTICE', 'ASSIGNMENT_CREATED', 'GRADE_POSTED', 'SESSION_SCHEDULED'
        ], 
        required: true 
    },
    title: { type: String, default: 'Notification' },
    message: { type: String, required: true },
    module: { 
        type: String, 
        enum: ['ecommerce', 'communication', 'gamification', 'users', 'system', 'academic'], 
        required: true 
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    actionUrl: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
