import express from 'express';
import { 
    getMessages, sendMessage, getConversations, searchUsers,
    getAdminComments, updateCommentStatus, addComment, deleteComment,
    getQA, addQuestion, deleteQuestion, toggleQAReserve, toggleGoldenKnowledge,
    getSettings, updateSettings,
    getNotices, addNotice, deleteNotice, getInstructorNotices,
    getUploadSignature, getAdminContact
} from '../controllers/communicationController.js';
import { adminAuth, instructorAuth, authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Direct Messaging
router.get('/messages', authMiddleware, getMessages);
router.post('/messages', authMiddleware, sendMessage);
router.get('/conversations', authMiddleware, getConversations);
router.get('/search-users', authMiddleware, searchUsers);

// Interaction & Moderation (Comments)
router.get('/comments', authMiddleware, getAdminComments);
router.post('/comments', authMiddleware, addComment);
router.delete('/comments/:id', authMiddleware, deleteComment);
router.patch('/comments/:id/status', adminAuth, updateCommentStatus); // Executive Moderation

// Q&A Hub Protocols
router.get('/qa', authMiddleware, getQA);
router.post('/qa', authMiddleware, addQuestion);
router.delete('/qa/:id', authMiddleware, deleteQuestion);
router.post('/qa/:id/reserve', authMiddleware, instructorAuth, toggleQAReserve); 
router.post('/qa/:id/golden', authMiddleware, instructorAuth, toggleGoldenKnowledge); 

// Institutional Alerts: Notices
router.get('/notices', authMiddleware, getNotices);
router.get('/instructor-notices', authMiddleware, instructorAuth, getInstructorNotices);
router.post('/notices', authMiddleware, instructorAuth, addNotice);
router.delete('/notices/:id', authMiddleware, instructorAuth, deleteNotice);

// Assets
router.get('/upload-signature', authMiddleware, getUploadSignature);

// Institutional Metadata
router.get('/admin-contact', authMiddleware, getAdminContact);

export default router;
