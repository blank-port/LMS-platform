import express from 'express';
import { 
    generateOutline, 
    generateQuiz, 
    generateQuickQuiz,
    getAiRecommendations,
    summarizeLesson,
    explainConcept,
    getKeyTakeaways,
    getWeaknessAnalysis,
    getStudyDirective,
    getFlashcards,
    deleteFlashcards,
    interviewInteraction,
    saveInterviewFeedback,
    getAllUserFlashcards,
    getUserInterviewHistory
} from '../controllers/aiController.js';
import { protectInstructor, protectUser } from '../middlewares/authMiddleware.js';

const aiRouter = express.Router();

// Educator Routes
aiRouter.post('/generate-outline', protectInstructor, generateOutline);
aiRouter.post('/generate-quiz', protectInstructor, generateQuiz);

// Student Routes
aiRouter.get('/recommendations', protectUser, getAiRecommendations);
aiRouter.post('/summarize-lesson', protectUser, summarizeLesson);
aiRouter.post('/explain-concept', protectUser, explainConcept);
aiRouter.post('/quick-quiz', protectUser, generateQuickQuiz);
aiRouter.post('/takeaways', protectUser, getKeyTakeaways);
aiRouter.get('/weakness-analysis', protectUser, getWeaknessAnalysis);
aiRouter.get('/study-directive', protectUser, getStudyDirective);
aiRouter.post('/flashcards', protectUser, getFlashcards);
aiRouter.post('/interview-chat', protectUser, interviewInteraction);
aiRouter.post('/interview-result', protectUser, saveInterviewFeedback);
aiRouter.get('/my-flashcards', protectUser, getAllUserFlashcards);
aiRouter.delete('/flashcards/:courseId/:lectureId', protectUser, deleteFlashcards);
aiRouter.get('/my-interviews', protectUser, getUserInterviewHistory);

export default aiRouter;
