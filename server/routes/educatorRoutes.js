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
import { v2 as cloudinary } from 'cloudinary';
import { courseSchema, updateCourseSchema } from '../validators/courseValidator.js';
import validate from '../middlewares/validator.js';

const instructorRouter = express.Router();

// Seed Dashboard Test Data (TEMP - Unauthenticated for easy seeding)
instructorRouter.get('/seed-test-data', seedDashboardTestData);

// All instructor routes require auth + instructor role + admin approval
instructorRouter.use(authMiddleware, authorize('instructor', 'admin'), instructorApproved);

instructorRouter.post('/add-course', upload.single('image'), courseSchema, validate, addCourse);
instructorRouter.put('/update-course/:id', upload.single('image'), updateCourseSchema, validate, updateCourse);
instructorRouter.delete('/delete-course/:id', deleteCourse);
instructorRouter.get('/courses', getInstructorCourses);
instructorRouter.get('/course/:id', getInstructorCourseById);
instructorRouter.get('/dashboard', instructorDashboardData);
instructorRouter.get('/enrolled-students', getEnrolledStudentsData);

// Image upload for questions
instructorRouter.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'question_images'
        });
        res.json({ success: true, url: result.secure_url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// New instructor panel routes
instructorRouter.get('/my-panel', getInstructorMyPanel);
instructorRouter.get('/payouts', getInstructorPayouts);
instructorRouter.get('/revenue', getInstructorRevenue);
instructorRouter.get('/course-stats', getInstructorCourseStats);
instructorRouter.get('/qa', getInstructorQA);
instructorRouter.post('/qa/reply', replyToQuestion);

export default instructorRouter;