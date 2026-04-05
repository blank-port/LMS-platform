import express from 'express';
import {
    addCourse, updateCourse, deleteCourse,
    getInstructorCourses, getInstructorCourseById, instructorDashboardData,
    getEnrolledStudentsData, seedDashboardTestData,
    getInstructorMyPanel, getInstructorPayouts,
    getInstructorRevenue, getInstructorCourseStats,
    getInstructorQA, replyToQuestion
} from '../controllers/instructorController.js';
import upload from '../configs/multer.js';
import { authMiddleware, authorize, instructorApproved } from '../middlewares/authMiddleware.js';

const instructorRouter = express.Router();

// Seed Dashboard Test Data (TEMP - Unauthenticated for easy seeding)
instructorRouter.get('/seed-test-data', seedDashboardTestData);

// All instructor routes require auth + instructor role + admin approval
instructorRouter.use(authMiddleware, authorize('instructor', 'admin'), instructorApproved);

instructorRouter.post('/add-course', upload.single('image'), addCourse);
instructorRouter.put('/update-course/:id', upload.single('image'), updateCourse);
instructorRouter.delete('/delete-course/:id', deleteCourse);
instructorRouter.get('/courses', getInstructorCourses);
instructorRouter.get('/course/:id', getInstructorCourseById);
instructorRouter.get('/dashboard', instructorDashboardData);
instructorRouter.get('/enrolled-students', getEnrolledStudentsData);

// New instructor panel routes
instructorRouter.get('/my-panel', getInstructorMyPanel);
instructorRouter.get('/payouts', getInstructorPayouts);
instructorRouter.get('/revenue', getInstructorRevenue);
instructorRouter.get('/course-stats', getInstructorCourseStats);
instructorRouter.get('/qa', getInstructorQA);
instructorRouter.post('/qa/reply', replyToQuestion);

export default instructorRouter;