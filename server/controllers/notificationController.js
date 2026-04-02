import Setting from '../models/Setting.js';
import User from '../models/User.js';

// Send Manual Push Broadcast (FCM simulation)
export const sendManualBroadcast = async (req, res) => {
    try {
        const { title, message, audience, image } = req.body;

        // In a real implementation, we would fetch FCM keys from settings
        // and use the firebase-admin SDK to send messages.
        const fcmKeys = await Setting.find({ key: { $regex: /^fcm_/ } });
        
        console.log(`📡 Dispatching Manual Broadcast: ${title} to ${audience}`);

        res.json({
            success: true,
            message: `Strategic alert successfully queued for ${audience}.`
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Notification Trigger Matrix
export const updateTriggerMatrix = async (req, res) => {
    try {
        const { matrix } = req.body; // e.g. { notify_course_published: 'Yes' }
        
        const updates = Object.entries(matrix).map(([key, value]) => {
            return Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
        });

        await Promise.all(updates);
        res.json({ success: true, message: 'Pedagogical trigger matrix synchronized.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
