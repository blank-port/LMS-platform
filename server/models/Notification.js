import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['COD_ORDER', 'NEW_QUESTION', 'NEW_MESSAGE', 'REWARD_REDEMPTION', 'NEW_USER', 'PAYMENT_SUCCESS', 'PAYMENT_FAILURE'], 
        required: true 
    },
    message: { type: String, required: true },
    module: { 
        type: String, 
        enum: ['ecommerce', 'communication', 'gamification', 'users', 'system'], 
        required: true 
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // ID of the order, message, etc.
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
