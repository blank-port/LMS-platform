import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { grantPoints } from '../services/gamificationService.js';
import { issueAutomatedCertificate } from './certificateController.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get All Quizzes
export const getAllQuizzes = asyncHandler(async (req, res, next) => {
    console.log('[Quiz Controller] Synchronizing all assessments...');
    try {
        const quizzes = await Quiz.find({})
            .populate('createdBy', 'name');
        console.log(`[Quiz Controller] Found ${quizzes.length} assessments`);
        return responseHelper.success(res, { quizzes }, 'All assessment blueprints synchronized');
    } catch (error) {
        console.error(`[Quiz Controller Error] ${error.message}`);
        return next(new AppError(`Assessment synchronization failed: ${error.message}`, 500));
    }
});

// Create Quiz (Instructor)
export const createQuiz = asyncHandler(async (req, res, next) => {
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

    return responseHelper.success(res, { quiz }, 'Assessment blueprint provisioned', 201);
});

// Get Quizzes for a Course
export const getQuizzesByCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ courseId })
        .populate('createdBy', 'name');
    return responseHelper.success(res, { quizzes }, 'Assessment registry synchronized');
});

// Get Single Quiz
export const getQuizById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
        return next(new AppError('Assessment artifact not found', 404));
    }

    // Mask assessment keys for students to prevent ledger leak
    const quizObj = quiz.toObject();
    if (req.user.role === 'student') {
        // Apply randomization if enabled
        if (quizObj.randomizeQuestions) {
            quizObj.questions = quizObj.questions
                .map(q => ({ ...q, _sort: Math.random() }))
                .sort((a, b) => a._sort - b._sort)
                .map(({ _sort, ...q }) => q);
        }

        quizObj.questions = quizObj.questions.map(q => ({
            ...q,
            correctAnswer: undefined
        }));
    }

    return responseHelper.success(res, { quiz: quizObj }, 'Assessment details synchronized');
});

// Submit Quiz Attempt
// Submit Quiz Attempt
export const submitQuiz = asyncHandler(async (req, res, next) => {
    const { quizId, answers } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        return next(new AppError('Assessment artifact not found', 404));
    }

    // Check attempt limits
    if (quiz.attemptsAllowed > 0) {
        const attemptCount = await QuizAttempt.countDocuments({ quizId, userId });
        if (attemptCount >= quiz.attemptsAllowed) {
            return next(new AppError(`Maximum attempts (${quiz.attemptsAllowed}) reached for this quiz`, 403));
        }
    }

    // Calculate mastery score
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

    // Institutional hooks: Rewards and Certifications
    if (isPassed) {
        await grantPoints(userId, 'quiz_pass', { percentage });
        
        const course = await Course.findById(quiz.courseId);
        if (course && course.issueMethod === 'quiz') {
            await issueAutomatedCertificate(userId, quiz.courseId);
        }
    }

    return responseHelper.success(res, {
        result: {
            score,
            totalQuestions,
            percentage,
            isPassed,
            attemptId: attempt._id
        }
    }, isPassed ? 'Assessment Passed! Mastery session achieved.' : 'Assessment Submitted. Minimum mastery session required.');
});

// Get Quiz Results
export const getQuizResults = asyncHandler(async (req, res, next) => {
    const { quizId } = req.params;
    const userId = req.user._id;

    const attempts = await QuizAttempt.find({ quizId, userId })
        .populate('quizId', 'title')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { attempts }, 'Personal assessment history synchronized');
});

// Get All Quiz Attempts for Instructor
export const getQuizAttempts = asyncHandler(async (req, res, next) => {
    const { quizId } = req.params;
    const attempts = await QuizAttempt.find({ quizId })
        .populate('userId', 'name email profilePicture')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { attempts }, 'Institutional assessment ledger synchronized');
});

// Delete Quiz
export const deleteQuiz = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) return next(new AppError('Assessment artifact not found', 404));
    await QuizAttempt.deleteMany({ quizId: id });
    return responseHelper.success(res, {}, 'Assessment artifact permanently purged');
});

// Update Quiz
export const updateQuiz = asyncHandler(async (req, res, next) => {
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
        return next(new AppError('Assessment artifact not found', 404));
    }

    return responseHelper.success(res, { quiz }, 'Assessment blueprint synchronized');
});

// Unified Quiz Reports (Instructor/Admin)
export const getUnifiedQuizReports = asyncHandler(async (req, res, next) => {
    let query = {};
    if (req.user.role === 'instructor') {
        const myQuizzes = await Quiz.find({ createdBy: req.user._id }).select('_id');
        query = { quizId: { $in: myQuizzes } };
    }

    const reports = await QuizAttempt.find(query)
        .populate('userId', 'name email')
        .populate('quizId', 'title courseId')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { reports }, 'Unified assessment metrics synchronized');
});

// Global Scholar Performance (Admin)
export const getScholarPerformance = asyncHandler(async (req, res, next) => {
    const performance = await User.aggregate([
        { $match: { role: 'student' } },
        { $project: { name: 1, email: 1 } },
        
        // Join Enrollments
        {
            $lookup: {
                from: 'enrollments',
                localField: '_id',
                foreignField: 'userId',
                as: 'enrollments'
            }
        },
        
        // Join QuizAttempts
        {
            $lookup: {
                from: 'quizattempts',
                localField: '_id',
                foreignField: 'userId',
                as: 'attempts'
            }
        },
        
        {
            $addFields: {
                // Avg Progress across all enrollments
                completion: {
                    $cond: [
                        { $gt: [{ $size: "$enrollments" }, 0] },
                        { $divide: [{ $sum: "$enrollments.progress" }, { $size: "$enrollments" }] },
                        0
                    ]
                },
                // Avg Score across all attempts
                avgScore: {
                    $cond: [
                        { $gt: [{ $size: "$attempts" }, 0] },
                        { $divide: [{ $sum: "$attempts.percentage" }, { $size: "$attempts" }] },
                        0
                    ]
                }
            }
        },
        
        { 
            $project: { 
                name: 1, 
                email: 1, 
                completion: { $round: ["$completion", 0] }, 
                avgScore: { $round: ["$avgScore", 0] } 
            } 
        },
        { $sort: { avgScore: -1 } }
    ]);

    return responseHelper.success(res, { performance }, 'Global academic mastery synchronized');
});
