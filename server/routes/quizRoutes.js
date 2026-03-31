import express from 'express';
import {
    createQuiz, getQuizzesByCourse, getQuizById,
    submitQuiz, getQuizResults, getQuizAttempts,
    deleteQuiz, updateQuiz, getUnifiedQuizReports, getScholarPerformance
} from '../controllers/quizController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const quizRouter = express.Router();

// All quiz routes require auth
quizRouter.use(authMiddleware);

// Instructor routes
quizRouter.post('/create', authorize('instructor', 'admin'), createQuiz);
quizRouter.put('/:id', authorize('instructor', 'admin'), updateQuiz);
quizRouter.delete('/:id', authorize('instructor', 'admin'), deleteQuiz);
quizRouter.get('/attempts/:quizId', authorize('instructor', 'admin'), getQuizAttempts);
quizRouter.get('/reports/unified', authorize('instructor', 'admin'), getUnifiedQuizReports);

// Student routes
quizRouter.post('/submit', submitQuiz);
quizRouter.get('/results/:quizId', getQuizResults);

// Shared routes
quizRouter.get('/course/:courseId', getQuizzesByCourse);
quizRouter.get('/:id', getQuizById);

export default quizRouter;
