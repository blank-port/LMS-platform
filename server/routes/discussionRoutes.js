import express from 'express';
import { addComment, getCourseComments, deleteComment } from '../controllers/discussionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const discussionRouter = express.Router();

// Public
discussionRouter.get('/course/:courseId', getCourseComments);

// Protected
discussionRouter.post('/add', authMiddleware, addComment);
discussionRouter.delete('/:id', authMiddleware, deleteComment);

export default discussionRouter;
