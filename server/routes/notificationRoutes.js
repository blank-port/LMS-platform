import express from 'express';
import {
    sendManualBroadcast,
    updateTriggerMatrix,
    getMyNotifications,
    acknowledgeNotification,
    getAdminNotificationOverview
} from '../controllers/notificationController.js';
import { adminAuth, authMiddleware } from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

// Admin-only Communication Nexus
notificationRouter.get('/admin-overview', adminAuth, getAdminNotificationOverview);
notificationRouter.post('/broadcast', adminAuth, sendManualBroadcast);
notificationRouter.post('/update-matrix', adminAuth, updateTriggerMatrix);

// Student/Universal Neural Alerts
notificationRouter.get('/my', authMiddleware, getMyNotifications);
notificationRouter.put('/ack/:id', authMiddleware, acknowledgeNotification);

export default notificationRouter;
