import express from 'express';
import { sendManualBroadcast, updateTriggerMatrix } from '../controllers/notificationController.js';
import { adminAuth } from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

// Admin-only Communication Nexus
notificationRouter.post('/broadcast', adminAuth, sendManualBroadcast);
notificationRouter.post('/update-matrix', adminAuth, updateTriggerMatrix);

export default notificationRouter;
