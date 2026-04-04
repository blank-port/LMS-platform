import Setting from '../models/Setting.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

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

// Get Student's Personal Notifications
export const getMyNotifications = async (req, res) => {
    try {
        const { lastParsedId } = req.query; // For pagination/infinite scroll
        let query = { user: req.user._id };
        
        if (lastParsedId) {
            query._id = { $lt: lastParsedId };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(10);
            
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Acknowledge (Mark as Read)
export const acknowledgeNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (id === 'all') {
            await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
        } else {
            await Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true });
        }

        res.json({ success: true, message: 'Institutional signal acknowledged.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
