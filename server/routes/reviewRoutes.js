import express from 'express';
import { addReview, getCourseReviews, deleteReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const reviewRouter = express.Router();

// Public
reviewRouter.get('/course/:courseId', getCourseReviews);

// Protected
reviewRouter.post('/add', authMiddleware, addReview);
reviewRouter.delete('/:id', authMiddleware, deleteReview);

export default reviewRouter;
