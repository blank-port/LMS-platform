import express from 'express';
import { addComment, getComments, deleteComment, moderateComment, toggleGoldenKnowledge } from '../controllers/discussionController.js';
import { authMiddleware, instructorAuth } from '../middlewares/authMiddleware.js';

const discussionRouter = express.Router();

// Public/Authenticated Fetching
discussionRouter.get('/fetch', getComments); // Uses query params for courseId/cohortId/lessonId

// Protected
discussionRouter.post('/add', authMiddleware, addComment);
discussionRouter.patch('/moderate/:id', instructorAuth, moderateComment);
discussionRouter.patch('/golden/:id', instructorAuth, toggleGoldenKnowledge);
discussionRouter.delete('/:id', authMiddleware, deleteComment);


export default discussionRouter;
