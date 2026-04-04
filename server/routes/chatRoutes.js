import express from 'express';
import {
    sendChatMessage,
    registerAiUser,
    searchCourses,
    checkEnrollment,
    getChatStatus
} from '../controllers/chatController.js';

const chatRouter = express.Router();

// All chat routes are PUBLIC — no auth required
chatRouter.get('/status', getChatStatus);
chatRouter.post('/message', sendChatMessage);
chatRouter.post('/register-user', registerAiUser);
chatRouter.get('/courses', searchCourses);
chatRouter.get('/enrollment', checkEnrollment);

export default chatRouter;
