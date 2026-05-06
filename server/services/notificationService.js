import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { broadcast } from './pusherService.js';

/**
 * Creates an administrative notification for all admin users.
 * @param {Object} params 
 * @param {string} params.type - enum value from Notification model
 * @param {string} params.message - description of the event
 * @param {string} params.module - module name
 * @param {string} [params.referenceId] - related record ID
 */
export const createAdminNotification = async ({ type, title, message, module, referenceId, actionUrl }) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('_id');
        
        const notifications = admins.map(admin => ({
            user: admin._id,
            type,
            title: title || 'Admin Alert',
            message,
            module,
            referenceId,
            actionUrl: actionUrl || ''
        }));

        const created = await Notification.insertMany(notifications);

        // Real-time broadcast (Strategic global channel for efficiency)
        await broadcast('admin-notifications-channel', 'new-notification', {
            type,
            message,
            module,
            referenceId
        });

        return created;
    } catch (error) {
        console.error('Failed to create administrative notification:', error);
    }
};

/**
 * Creates notifications for multiple users in a single operation.
 */
export const createBatchNotifications = async (userIds, { type, title, message, module, referenceId, actionUrl }) => {
    try {
        const notifications = userIds.map(userId => ({
            user: userId,
            type,
            title: title || 'Notification',
            message,
            module,
            referenceId,
            actionUrl: actionUrl || ''
        }));

        const created = await Notification.insertMany(notifications);

        // Real-time broadcast for each (parallelized)
        await Promise.all(userIds.map(userId => 
            broadcast(`private-user-${userId}`, 'new-notification', {
                type,
                message,
                module,
                referenceId,
                createdAt: new Date()
            })
        ));

        return created;
    } catch (error) {
        console.error('Failed to create batch notifications:', error);
    }
};

/**
 * Creates a notification for a specific user.
 * @param {Object} params 
 * @param {string} params.userId - target user ID
 * @param {string} params.type - enum value from Notification model
 * @param {string} params.message - description of the event
 * @param {string} params.module - module name
 * @param {string} [params.referenceId] - related record ID
 */
export const createStudentNotification = async ({ userId, type, title, message, module, referenceId, actionUrl }) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title: title || 'Notification',
            message,
            module,
            referenceId,
            actionUrl: actionUrl || ''
        });

        // Real-time broadcast for the specific student
        await broadcast(`private-user-${userId}`, 'new-notification', {
            id: notification._id,
            type,
            title: notification.title,
            message,
            module,
            referenceId,
            actionUrl: notification.actionUrl,
            createdAt: notification.createdAt
        });

        return notification;
    } catch (error) {
        console.error('Failed to create student notification:', error);
    }
};
