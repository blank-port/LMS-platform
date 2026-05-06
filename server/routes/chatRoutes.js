import express from 'express';
import {
    sendChatMessage,
    registerAiUser,
    searchCourses,
    checkEnrollment,
    getChatStatus,
    getChatHistory,
    clearChatHistory,
    escalateToSupport
} from '../controllers/chatController.js';
import { protectUser, optionalUser } from '../middlewares/authMiddleware.js';

const chatRouter = express.Router();

chatRouter.get('/status', getChatStatus);
chatRouter.post('/message', optionalUser, sendChatMessage);
chatRouter.get('/history/:sessionId', optionalUser, getChatHistory);
chatRouter.delete('/session/:sessionId', optionalUser, clearChatHistory);
chatRouter.post('/register-user', registerAiUser);
chatRouter.post('/escalate', protectUser, escalateToSupport);
chatRouter.get('/courses', searchCourses);
chatRouter.get('/enrollment', checkEnrollment);

export default chatRouter;
