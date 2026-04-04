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
export const createAdminNotification = async ({ type, message, module, referenceId }) => {
    try {
        const admins = await User.find({ role: 'admin' });
        
        const notificationPromises = admins.map(admin => {
            return Notification.create({
                user: admin._id,
                type,
                message,
                module,
                referenceId
            });
        });

        const createdNotifications = await Promise.all(notificationPromises);

        // Real-time broadcast for each admin
        // We broadcast to a global admin channel or individual admin channels
        await broadcast('admin-notifications-channel', 'new-notification', {
            type,
            message,
            module,
            referenceId
        });

        return createdNotifications;
    } catch (error) {
        console.error('Failed to create administrative notification:', error);
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
export const createStudentNotification = async ({ userId, type, message, module, referenceId }) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            message,
            module,
            referenceId
        });

        // Real-time broadcast for the specific student
        await broadcast(`private-user-${userId}`, 'new-notification', {
            id: notification._id,
            type,
            message,
            module,
            referenceId,
            createdAt: notification.createdAt
        });

        return notification;
    } catch (error) {
        console.error('Failed to create student notification:', error);
    }
};
