import express from 'express';
import {
    getDashboardStats, getAllUsers, createUser, updateUser, deleteUser, getUserById,
    getAllInstructors, approveInstructor,
    getAllCoursesAdmin, updateCourseStatus, deleteCourseAdmin, updateCourseAdmin,
    createCategory, updateCategory, deleteCategory, getScholarPerformance,
    getAllPayouts, updatePayoutStatus
} from '../controllers/adminController.js';
import { getAllCategories } from '../controllers/courseController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const adminRouter = express.Router();

// All admin routes require auth + admin role
adminRouter.use(authMiddleware, authorize('admin'));

// Dashboard
adminRouter.get('/dashboard', getDashboardStats);

// Users
adminRouter.get('/users', getAllUsers);
adminRouter.post('/users', createUser);
adminRouter.get('/users/:id', getUserById);
adminRouter.put('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);

// Instructors
adminRouter.get('/instructors', getAllInstructors);
adminRouter.put('/instructors/:id/approve', approveInstructor);

// Courses
adminRouter.get('/courses', getAllCoursesAdmin);
adminRouter.put('/courses/:id/status', updateCourseStatus);
adminRouter.put('/courses/:id', upload.single('image'), updateCourseAdmin);
adminRouter.delete('/courses/:id', deleteCourseAdmin);
adminRouter.delete('/courses/:id', deleteCourseAdmin);

// Categories
adminRouter.get('/categories', getAllCategories);
adminRouter.post('/categories', createCategory);
adminRouter.put('/categories/:id', updateCategory);
adminRouter.delete('/categories/:id', deleteCategory);

// Reports
adminRouter.get('/scholar-performance', getScholarPerformance);

// Instructor Payouts
adminRouter.get('/instructor-payouts', getAllPayouts);
adminRouter.put('/instructor-payouts/:id/status', updatePayoutStatus);

export default adminRouter;
