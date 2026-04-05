import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { grantPoints } from '../services/gamificationService.js';
import { issueAutomatedCertificate } from './certificateController.js';

// Create Quiz (Instructor)
export const createQuiz = async (req, res) => {
    try {
        const { 
            courseId, 
            title, 
            instructions, 
            duration, 
            passingScore, 
            randomizeQuestions, 
            allowReview, 
            attemptsAllowed, 
            questions 
        } = req.body;
 
        const quiz = await Quiz.create({
            courseId,
            title,
            instructions,
            duration,
            passingScore,
            randomizeQuestions,
            allowReview,
            attemptsAllowed,
            questions,
            createdBy: req.user._id
        });

        res.json({ success: true, message: 'Quiz created', quiz });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Quizzes for a Course
export const getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const quizzes = await Quiz.find({ courseId })
            .populate('createdBy', 'name');
        res.json({ success: true, quizzes });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Single Quiz
export const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        // Remove correct answers for students
        const quizObj = quiz.toObject();
        if (req.user.role === 'student') {
            quizObj.questions = quizObj.questions.map(q => ({
                ...q,
                correctAnswer: undefined
            }));
        }

        res.json({ success: true, quiz: quizObj });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Submit Quiz Attempt
export const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const userId = req.user._id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        const isPassed = percentage >= (quiz.passingScore || 50);

        const attempt = await QuizAttempt.create({
            quizId,
            userId,
            answers,
            score,
            totalQuestions,
            percentage,
            isPassed
        });

        // Gamification hook
        if (isPassed) {
            await grantPoints(userId, 'quiz_pass', { percentage });
            
            const course = await Course.findById(quiz.courseId);
            if (course && course.issueMethod === 'quiz') {
                await issueAutomatedCertificate(userId, quiz.courseId);
            }
        }

        res.json({
            success: true,
            message: isPassed ? 'Quiz Passed! Mastery Achieved.' : 'Quiz Submitted. Minimum mastery session required.',
            result: {
                score,
                totalQuestions,
                percentage,
                isPassed,
                attemptId: attempt._id
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Quiz Results
export const getQuizResults = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user._id;

        const attempts = await QuizAttempt.find({ quizId, userId })
            .populate('quizId', 'title')
            .sort({ createdAt: -1 });

        res.json({ success: true, attempts });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Quiz Attempts for Instructor
export const getQuizAttempts = async (req, res) => {
    try {
        const { quizId } = req.params;
        const attempts = await QuizAttempt.find({ quizId })
            .populate('userId', 'name email profilePicture')
            .sort({ createdAt: -1 });

        res.json({ success: true, attempts });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Quiz
export const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        await Quiz.findByIdAndDelete(id);
        await QuizAttempt.deleteMany({ quizId: id });
        res.json({ success: true, message: 'Quiz deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Quiz
export const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            instructions, 
            duration, 
            passingScore, 
            randomizeQuestions, 
            allowReview, 
            attemptsAllowed, 
            questions 
        } = req.body;
 
        const quiz = await Quiz.findByIdAndUpdate(
            id,
            { 
                title, 
                instructions, 
                duration, 
                passingScore, 
                randomizeQuestions, 
                allowReview, 
                attemptsAllowed, 
                questions 
            },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        res.json({ success: true, message: 'Quiz updated', quiz });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Unified Quiz Reports (Instructor/Admin)
export const getUnifiedQuizReports = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'instructor') {
            const myQuizzes = await Quiz.find({ createdBy: req.user._id }).select('_id');
            query = { quizId: { $in: myQuizzes } };
        }

        const reports = await QuizAttempt.find(query)
            .populate('userId', 'name email')
            .populate('quizId', 'title courseId')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Global Scholar Performance (Admin)
export const getScholarPerformance = async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const Enrollment = (await import('../models/Enrollment.js')).default;

        const students = await User.find({ role: 'student' }).select('name email');
        
        const performance = await Promise.all(students.map(async (student) => {
            const enrollments = await Enrollment.find({ userId: student._id });
            const avgProgress = enrollments.length > 0 
                ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)
                : 0;

            const attempts = await QuizAttempt.find({ userId: student._id });
            const avgScore = attempts.length > 0
                ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)
                : 0;

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                completion: avgProgress,
                avgScore
            };
        }));

        res.json({ success: true, performance });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
