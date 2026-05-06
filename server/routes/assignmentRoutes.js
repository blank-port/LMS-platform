import express from 'express';
import { 
    getAssignmentsByCourse, 
    submitAssignment, 
    getStudentSubmissions, 
    gradeSubmission,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissionsByAssignment
} from '../controllers/assignmentController.js';
import { studentAuth, instructorAuth } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const assignmentRouter = express.Router();

assignmentRouter.get('/course/:courseId', studentAuth, getAssignmentsByCourse);
assignmentRouter.post('/submit', studentAuth, upload.array('attachments'), submitAssignment);
assignmentRouter.get('/my-submissions', studentAuth, getStudentSubmissions);
assignmentRouter.post('/grade/:submissionId', instructorAuth, gradeSubmission);

// Instructor CRUD
assignmentRouter.post('/create', instructorAuth, createAssignment);
assignmentRouter.put('/:assignmentId', instructorAuth, updateAssignment);
assignmentRouter.delete('/:assignmentId', instructorAuth, deleteAssignment);
assignmentRouter.get('/submissions/:assignmentId', instructorAuth, getSubmissionsByAssignment);

export default assignmentRouter;
