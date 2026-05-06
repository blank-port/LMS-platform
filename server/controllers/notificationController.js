import mongoose from 'mongoose';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const TRIGGER_DEFAULTS = {
    notify_course_published: 'Yes',
    notify_new_enrollment: 'Yes',
    notify_assignment_submitted: 'No'
};

const AUDIENCE_DEFINITIONS = {
    students: { label: 'Students', query: { role: 'student' } },
    instructors: { label: 'Educators', query: { role: 'instructor' } },
    admins: { label: 'Admins', query: { role: 'admin' } },
    all_users: { label: 'Everyone', query: {} }
};

const normalizeAudience = (audience = '') => {
    const value = String(audience).trim().toLowerCase();

    if (!value) return 'students';

    const aliases = {
        'all students': 'students',
        student: 'students',
        students: 'students',
        'educators only': 'instructors',
        educator: 'instructors',
        educators: 'instructors',
        instructor: 'instructors',
        instructors: 'instructors',
        admin: 'admins',
        admins: 'admins',
        'all users': 'all_users',
        everyone: 'all_users',
        all: 'all_users',
        'premium subscribers': 'students'
    };

    return aliases[value] || value;
};

// Send Manual Push Broadcast (FCM simulation + Actual Persistence)
export const sendManualBroadcast = asyncHandler(async (req, res, next) => {
    const { title, message, audience, image } = req.body;
    const normalizedAudience = normalizeAudience(audience);
    const audienceConfig = AUDIENCE_DEFINITIONS[normalizedAudience];

    if (!title?.trim() || !message?.trim()) {
        return next(new AppError('Broadcast title and message are required', 400));
    }

    if (!audienceConfig) {
        return next(new AppError('Unsupported broadcast audience selected', 400));
    }

    // Tactical Persistence: Create actual notification records for target scholarly audience
    const query = audienceConfig.query;

    const users = await User.find(query).select('_id');
    const broadcastId = new mongoose.Types.ObjectId().toString();
    
    if (users.length > 0) {
        const notifications = users.map(user => ({
            user: user._id,
            type: 'INSTITUTIONAL_NOTICE',
            title: title.trim() || 'Institutional Notice',
            message: message.trim(),
            module: 'system',
            metadata: {
                ...(image ? { image } : {}),
                broadcastId,
                audience: normalizedAudience
            },
            isRead: false
        }));

        await Notification.insertMany(notifications);
    }
    
    console.log(`[Broadcast] Dispatching Manual Broadcast: ${title} to ${users.length} users in ${normalizedAudience}`);

    return responseHelper.success(
        res,
        {
            recipientCount: users.length,
            audience: normalizedAudience,
            broadcastId
        },
        `Strategic alert successfully broadcast to ${users.length} recipients.`
    );
});

// Update Notification Trigger Matrix
export const updateTriggerMatrix = asyncHandler(async (req, res, next) => {
    const { matrix } = req.body; // e.g. { notify_course_published: 'Yes' }
    
    const updates = Object.entries(matrix).map(([key, value]) => {
        return Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
    });

    await Promise.all(updates);
    return responseHelper.success(res, {}, 'Pedagogical trigger matrix synchronized.');
});

export const getAdminNotificationOverview = asyncHandler(async (req, res, next) => {
    const [settings, audienceCounts, recentBroadcasts] = await Promise.all([
        Setting.find({
            key: {
                $in: [
                    'fcm_project_id',
                    'fcm_client_email',
                    'fcm_private_key',
                    'pusher_app_id',
                    'pusher_app_key',
                    'pusher_app_secret',
                    'pusher_app_cluster',
                    ...Object.keys(TRIGGER_DEFAULTS)
                ]
            }
        }).lean(),
        User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]),
        Notification.aggregate([
            { $match: { type: 'INSTITUTIONAL_NOTICE', 'metadata.broadcastId': { $exists: true } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$metadata.broadcastId',
                    title: { $first: '$title' },
                    message: { $first: '$message' },
                    audience: { $first: '$metadata.audience' },
                    image: { $first: '$metadata.image' },
                    createdAt: { $first: '$createdAt' },
                    recipients: { $sum: 1 },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $eq: ['$isRead', false] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 8 }
        ])
    ]);

    const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    const triggers = Object.fromEntries(
        Object.entries(TRIGGER_DEFAULTS).map(([key, defaultValue]) => [
            key,
            settingsMap[key] || defaultValue
        ])
    );

    const audienceTotals = audienceCounts.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
    }, {});

    const studentCount = audienceTotals.student || 0;
    const instructorCount = audienceTotals.instructor || 0;
    const adminCount = audienceTotals.admin || 0;

    const pusherReady = Boolean(
        settingsMap.pusher_app_id &&
        settingsMap.pusher_app_key &&
        settingsMap.pusher_app_secret &&
        settingsMap.pusher_app_cluster
    );

    const fcmReady = Boolean(
        settingsMap.fcm_project_id &&
        settingsMap.fcm_client_email &&
        settingsMap.fcm_private_key
    );

    return responseHelper.success(res, {
        configStatus: {
            pusherReady,
            fcmReady
        },
        triggers,
        audienceCounts: {
            students: studentCount,
            instructors: instructorCount,
            admins: adminCount,
            all_users: studentCount + instructorCount + adminCount
        },
        recentBroadcasts: recentBroadcasts.map((broadcast) => ({
            id: broadcast._id,
            title: broadcast.title,
            message: broadcast.message,
            audience: broadcast.audience || 'students',
            image: broadcast.image || '',
            recipients: broadcast.recipients,
            unreadCount: broadcast.unreadCount,
            createdAt: broadcast.createdAt
        }))
    }, 'Notification command center synchronized.');
});

// Get Student's Personal Notifications
export const getMyNotifications = asyncHandler(async (req, res, next) => {
    const { lastParsedId } = req.query; // For pagination/infinite scroll
    let query = { user: req.user._id };
    
    if (lastParsedId) {
        query._id = { $lt: lastParsedId };
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(10);
        
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    return responseHelper.success(res, { notifications, unreadCount }, 'Personal scholarly signal registry synchronized');
});

// Acknowledge (Mark as Read)
export const acknowledgeNotification = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (id === 'all') {
        await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    } else {
        const update = await Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true });
        if (!update) return next(new AppError('Institutional signal not found', 404));
    }

    return responseHelper.success(res, {}, 'Institutional signal acknowledged.');
});
