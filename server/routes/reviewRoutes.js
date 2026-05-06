import express from 'express';
import { addReview, getCourseReviews, deleteReview, getAllReviews, updateReviewStatus } from '../controllers/reviewController.js';
import { authMiddleware, adminAuth } from '../middlewares/authMiddleware.js';

const reviewRouter = express.Router();

// Public
reviewRouter.get('/course/:courseId', getCourseReviews);

// Protected
reviewRouter.post('/add', authMiddleware, addReview);
reviewRouter.delete('/:id', authMiddleware, deleteReview);

// Admin Only
reviewRouter.get('/all', adminAuth, getAllReviews);
reviewRouter.patch('/:id/status', adminAuth, updateReviewStatus);

export default reviewRouter;
