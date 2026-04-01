import mongoose from 'mongoose';

const communicationSettingSchema = new mongoose.Schema({
    allowQuestionReplyRoles: [{ type: String, enum: ['admin', 'instructor', 'staff'], default: ['admin', 'instructor'] }],
    realtimeNotifications: { type: Boolean, default: true },
    autoApproveComments: { type: Boolean, default: true },
    profanityFilter: { type: Boolean, default: false },
    maxMessageLength: { type: Number, default: 2000 }
}, { timestamps: true });

const CommunicationSetting = mongoose.model('CommunicationSetting', communicationSettingSchema);
export default CommunicationSetting;
