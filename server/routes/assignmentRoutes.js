import express from 'express';
import { getAssignmentsByCourse, submitAssignment, getStudentSubmissions, gradeSubmission } from '../controllers/assignmentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const assignmentRouter = express.Router();

assignmentRouter.get('/course/:courseId', authMiddleware, getAssignmentsByCourse);
assignmentRouter.post('/submit', authMiddleware, upload.array('attachments'), submitAssignment);
assignmentRouter.get('/my-submissions', authMiddleware, getStudentSubmissions);
assignmentRouter.post('/grade/:submissionId', authMiddleware, gradeSubmission); // For admin/instructors

export default assignmentRouter;
