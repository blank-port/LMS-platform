import express from 'express';
import { sendMessage, getMessages, getConversationThreads, postComment, getComments } from '../controllers/communicationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const commRouter = express.Router();

commRouter.post('/send', authMiddleware, sendMessage);
commRouter.get('/messages', authMiddleware, getMessages);
commRouter.get('/threads', authMiddleware, getConversationThreads);
commRouter.post('/comment', authMiddleware, postComment);
commRouter.get('/comments', getComments);

// Notices
import { postNotice, getNotices, getInstructorNotices } from '../controllers/communicationController.js';
commRouter.post('/notice', authMiddleware, postNotice);
commRouter.get('/notices', getNotices);
commRouter.get('/instructor-notices', authMiddleware, getInstructorNotices);

export default commRouter;
