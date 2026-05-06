import express from 'express';
import { 
    createQuiz, 
    updateQuiz, 
    deleteQuiz, 
    getAllQuizzes, 
    getQuizById, 
    getQuizzesByCourse,
    submitQuiz,
    getQuizAttempts,
    getQuizResults,
    getUnifiedQuizReports
} from '../controllers/quizController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const quizRouter = express.Router();

// All quiz routes require auth
quizRouter.use(authMiddleware);

// Instructor routes
quizRouter.get('/all', getAllQuizzes); // Moved up to prevent shadowing
quizRouter.get('/attempts/:quizId', authorize('instructor', 'admin'), getQuizAttempts);
quizRouter.get('/reports/unified', authorize('instructor', 'admin'), getUnifiedQuizReports);
quizRouter.post('/create', authorize('instructor', 'admin'), createQuiz);
quizRouter.post('/', authorize('instructor', 'admin'), createQuiz); // Dual route support

// Common routes
quizRouter.get('/course/:courseId', getQuizzesByCourse);
quizRouter.get('/:id', getQuizById); // Parameterized route stays below /all

// Student routes
quizRouter.post('/submit/:quizId', submitQuiz);
quizRouter.get('/results/my', getQuizResults);

// Legacy/Alternative management routes
quizRouter.put('/:id', authorize('instructor', 'admin'), updateQuiz);
quizRouter.delete('/:id', authorize('instructor', 'admin'), deleteQuiz);

export default quizRouter;
