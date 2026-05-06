import express from 'express';
import {
    getAllCourses, getCourseById, searchCourses, enrollCourse,
    getEnrolledCourses, updateCourseProgress, getCourseProgress,
    getAllCategories, getCourseFullContent, getPopularityStats
} from '../controllers/courseController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const courseRouter = express.Router();

// Public routes
courseRouter.get('/all', getAllCourses);
courseRouter.get('/search', searchCourses);
courseRouter.get('/categories', getAllCategories);
courseRouter.get('/popularity-stats', getPopularityStats);

// Protected routes (students)
courseRouter.post('/enroll', authMiddleware, enrollCourse);
courseRouter.get('/enrolled/my-courses', authMiddleware, getEnrolledCourses);
courseRouter.post('/progress/update', authMiddleware, updateCourseProgress);
courseRouter.get('/progress/:courseId', authMiddleware, getCourseProgress);
courseRouter.get('/full/:id', authMiddleware, getCourseFullContent);
courseRouter.get('/:id', getCourseById);

export default courseRouter;