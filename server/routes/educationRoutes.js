import express from 'express';
import { 
    createQuestionGroup, 
    getQuestionGroups, 
    getAllQuestionGroups, 
    addQuestionToBank, 
    getQuestionsFromBank, 
    updateQuestionInBank, 
    deleteQuestionFromBank, 
    setupQuiz, 
    updateCourseEducationFields,
    importQuestions,
    getAllQuizzes
} from '../controllers/educationController.js';
import { instructorAuth } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const educationRouter = express.Router();

educationRouter.post('/question-group', instructorAuth, createQuestionGroup);
educationRouter.get('/question-group/all', instructorAuth, getAllQuestionGroups);
educationRouter.get('/question-group/:courseId', instructorAuth, getQuestionGroups);
educationRouter.post('/question-bank', instructorAuth, addQuestionToBank);
educationRouter.get('/question-bank/:groupId', instructorAuth, getQuestionsFromBank);
educationRouter.put('/question-bank/:id', instructorAuth, updateQuestionInBank);
educationRouter.delete('/question-bank/:id', instructorAuth, deleteQuestionFromBank);
educationRouter.post('/question-import', instructorAuth, upload.single('file'), importQuestions);
educationRouter.post('/quiz-setup', instructorAuth, setupQuiz);
educationRouter.get('/quiz-setup/all', instructorAuth, getAllQuizzes);
educationRouter.put('/course-fields', instructorAuth, updateCourseEducationFields);

export default educationRouter;
