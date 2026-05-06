import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema({
    cohortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cohort',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // In minutes
        required: true,
        default: 60
    },
    provider: {
        type: String,
        enum: ['livekit', 'external'],
        default: 'livekit'
    },
    roomName: {
        type: String,
        default: ''
    },
    meetingLink: {
        type: String,
        default: ''
    },
    sessionStatus: {
        type: String,
        enum: ['scheduled', 'live', 'ended', 'cancelled'],
        default: 'scheduled'
    },
    recordingUrl: {
        type: String,
        default: '' // External link for catch-up (Zoom, YouTube, etc.)
    },
    attendance: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        isPresent: { type: Boolean, default: true }
    }],
    activityLog: [{
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorName: { type: String, default: 'System' },
        actorRole: { type: String, default: 'system' },
        action: { type: String, required: true },
        note: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
    }],
    reminderHistory: [{
        sentAt: { type: Date, default: Date.now },
        reminderType: { type: String, default: 'scheduled' },
        recipientCount: { type: Number, default: 0 },
        triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    lastReminderSentAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
export default LiveSession;
