import express from 'express';
import {
    getDashboardStats, getAllUsers, createUser, updateUser, deleteUser, getUserById,
    getAllInstructors, approveInstructor,
    getAllCoursesAdmin, updateCourseStatus, deleteCourseAdmin, updateCourseAdmin,
    createCategory, updateCategory, deleteCategory, getScholarPerformance,
    getAllPayouts, updatePayoutStatus, getAllEnrollmentsAdmin,
    getCertificateTemplates, createCertificateTemplate, updateCertificateTemplate, deleteCertificateTemplate
} from '../controllers/adminController.js';
import {
    cancelAdminLiveSession,
    dispatchDueLiveReminders,
    getAdminLiveOverview,
    getAdminLiveSessionDetail,
    sendAdminLiveReminder,
    updateAdminLiveSession
} from '../controllers/liveAdminController.js';
import { getAllCategories, getCourseById } from '../controllers/courseController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const adminRouter = express.Router();

// All admin routes require auth + admin role
adminRouter.use(authMiddleware, authorize('admin'));

// Dashboard
adminRouter.get('/dashboard', getDashboardStats);
adminRouter.get('/live/overview', getAdminLiveOverview);
adminRouter.get('/live/sessions/:sessionId', getAdminLiveSessionDetail);
adminRouter.put('/live/sessions/:sessionId', updateAdminLiveSession);
adminRouter.patch('/live/sessions/:sessionId/cancel', cancelAdminLiveSession);
adminRouter.post('/live/sessions/:sessionId/remind', sendAdminLiveReminder);
adminRouter.post('/live/reminders/dispatch', dispatchDueLiveReminders);

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
adminRouter.get('/courses/:id', getCourseById);
adminRouter.delete('/courses/:id', deleteCourseAdmin);
adminRouter.put('/courses/:id', upload.single('image'), updateCourseAdmin);

// Categories
adminRouter.get('/categories', getAllCategories);
adminRouter.post('/categories', createCategory);
adminRouter.put('/categories/:id', updateCategory);
adminRouter.delete('/categories/:id', deleteCategory);

// Reports
adminRouter.get('/scholar-performance', getScholarPerformance);
adminRouter.get('/enrollments', getAllEnrollmentsAdmin);

// Instructor Payouts
adminRouter.get('/instructor-payouts', getAllPayouts);
adminRouter.put('/instructor-payouts/:id/status', updatePayoutStatus);

// Certificate Templates
adminRouter.get('/certificates/templates', getCertificateTemplates);
adminRouter.post('/certificates/templates', createCertificateTemplate);
adminRouter.put('/certificates/templates/:id', updateCertificateTemplate);
adminRouter.delete('/certificates/templates/:id', deleteCertificateTemplate);

export default adminRouter;
