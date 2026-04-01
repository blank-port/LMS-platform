import express from 'express';
import { 
    getMessages, sendMessage, 
    getAdminComments, updateCommentStatus, addComment, deleteComment,
    getQA, addQuestion, deleteQuestion, toggleQAReserve, 
    getSettings, updateSettings,
    getNotices, addNotice
} from '../controllers/communicationController.js';
import { adminAuth, instructorAuth, authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Direct Messaging
router.get('/messages', authMiddleware, getMessages);
router.post('/messages', authMiddleware, sendMessage);

// Interaction & Moderation (Comments)
router.get('/comments', authMiddleware, getAdminComments);
router.post('/comments', authMiddleware, addComment);
router.delete('/comments/:id', authMiddleware, deleteComment);
router.patch('/comments/:id/status', authMiddleware, adminAuth, updateCommentStatus); // Executive Moderation

// Q&A Hub Protocols
router.get('/qa', authMiddleware, getQA);
router.post('/qa', authMiddleware, addQuestion);
router.delete('/qa/:id', authMiddleware, deleteQuestion);
router.post('/qa/:id/reserve', authMiddleware, instructorAuth, toggleQAReserve); // Instructor/Admin Only

// Institutional Alerts: Notices
router.get('/notices', authMiddleware, getNotices);
router.post('/notices', authMiddleware, instructorAuth, addNotice);

// Settings
router.get('/settings', authMiddleware, adminAuth, getSettings);
router.put('/settings', authMiddleware, adminAuth, updateSettings);

export default router;
