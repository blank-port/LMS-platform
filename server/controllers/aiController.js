import {
    generateCourseOutline,
    generateQuizQuestions, 
    getCourseRecommendations,
    summarizeLessonContent,
    explainComplexConcept,
    generateKeyTakeaways,
    detectWeaknesses,
    getStudyPlan,
    generateFlashcardsForLesson,
    conductMockInterview
} from '../services/aiService.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Cohort from '../models/Cohort.js';
import LiveSession from '../models/LiveSession.js';
import Flashcard from '../models/Flashcard.js';
import InterviewFeedback from '../models/InterviewFeedback.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller for AI-powered features.
 * Implements simple in-memory caching to reduce redundant AI generation calls.
 */
const CACHE = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const getCached = (key) => {
    const entry = CACHE.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        CACHE.delete(key);
        return null;
    }
    return entry.data;
};

const setCache = (key, data) => {
    CACHE.set(key, { data, timestamp: Date.now() });
};

const average = (values = []) => {
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const buildIncompleteLectureHints = (enrollments = []) => {
    const hints = [];

    enrollments.forEach((enrollment) => {
        const completed = new Set((enrollment.completedLessons || []).map(String));
        const chapters = enrollment.courseId?.courseContent || [];

        for (const chapter of chapters) {
            for (const lecture of chapter.chapterContent || []) {
                const lectureId = String(lecture._id || lecture.lectureId || '');
                if (lectureId && !completed.has(lectureId)) {
                    hints.push(`${enrollment.courseId?.courseTitle || 'Course'}: ${lecture.lectureTitle}`);
                    if (hints.length >= 3) return hints;
                }
            }
        }
    });

    return hints;
};

export const generateOutline = asyncHandler(async (req, res, next) => {
    const { title, category } = req.body;
    if (!title) return next(new AppError("Course title is required for AI generation.", 400));

    const result = await generateCourseOutline(title, category || "General Education");
    if (!result.success) return next(new AppError(result.message || "AI Generation failed", 500));
    
    return responseHelper.success(res, result.data, result.message);
});

export const generateQuiz = asyncHandler(async (req, res, next) => {
    const { topic, count } = req.body;
    if (!topic) return next(new AppError("Topic is required for AI quiz generation.", 400));

    const result = await generateQuizQuestions(topic, count || 5);
    if (!result.success) return next(new AppError(result.message || "AI Quiz generation failed", 500));

    return responseHelper.success(res, result.data, result.message);
});

export const generateQuickQuiz = asyncHandler(async (req, res, next) => {
    const { lessonTitle, courseTitle } = req.body;
    const topic = `Lesson "${lessonTitle}" from course "${courseTitle}"`;
    
    const result = await generateQuizQuestions(topic, 3); // Quick 3 questions
    if (!result.success) return next(new AppError(result.message || "Quick AI Quiz generation failed", 500));
    
    return responseHelper.success(res, { questions: result.data }, "Neural check-in synchronized");
});

export const getAiRecommendations = asyncHandler(async (req, res, next) => {
    const { interests } = req.query; // Expecting comma-separated string
    if (!interests) return responseHelper.success(res, { recommendedCourses: [] });

    const interestArray = interests.split(',').map(i => i.trim());
    
    // Fetch published courses to recommend from
    const courses = await Course.find({ isPublished: true })
        .populate('category', 'name')
        .select('courseTitle category');

    const result = await getCourseRecommendations(interestArray, courses);
    
    if (result.success) {
        // Fetch full course details for the recommended IDs
        const recommendedIds = Array.isArray(result.data) ? result.data : [];
        const recommendedCourses = await Course.find({ _id: { $in: recommendedIds } })
            .populate('instructor', 'name profilePicture email')
            .populate('category', 'name');
        
        return responseHelper.success(res, { recommendedCourses });
    }
    
    // Graceful degradation: return empty recommendations instead of crashing
    const isQuota = (result.message || '').toLowerCase().includes('quota');
    if (isQuota) {
        return responseHelper.success(res, { recommendedCourses: [], aiUnavailable: true }, 'AI temporarily at capacity');
    }
    return responseHelper.success(res, { recommendedCourses: [] }, result.message || 'Recommendations unavailable');
});

export const summarizeLesson = asyncHandler(async (req, res, next) => {
    const { title, content } = req.body;
    if (!title) return next(new AppError("Lesson title is required for summarization.", 400));

    const cacheKey = `summary_${title}_${content?.substring(0, 50)}`;
    const cached = getCached(cacheKey);
    if (cached) return responseHelper.success(res, { summary: cached });

    const result = await summarizeLessonContent(title, content || "");
    if (!result.success) return next(new AppError(result.message || "Summarization failed", 500));

    setCache(cacheKey, result.text);
    return responseHelper.success(res, { summary: result.text });
});

export const explainConcept = asyncHandler(async (req, res, next) => {
    const { concept } = req.body;
    if (!concept) return next(new AppError("Concept name is required for explanation.", 400));

    const cacheKey = `explain_${concept}`;
    const cached = getCached(cacheKey);
    if (cached) return responseHelper.success(res, { explanation: cached });

    const result = await explainComplexConcept(concept);
    if (!result.success) return next(new AppError(result.message || "Explanation failed", 500));

    setCache(cacheKey, result.text);
    return responseHelper.success(res, { explanation: result.text });
});

export const getKeyTakeaways = asyncHandler(async (req, res, next) => {
    const { title, content } = req.body;
    if (!title) return next(new AppError("Lesson title is required for takeaways.", 400));

    const result = await generateKeyTakeaways(title, content || "");
    if (!result.success) return next(new AppError(result.message || "Takeaways generation failed", 500));

    return responseHelper.success(res, { takeaways: result.text });
});

export const getWeaknessAnalysis = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const activeEnrollments = await Enrollment.find({ userId, status: 'active' })
        .populate({
            path: 'courseId',
            select: 'courseTitle courseContent'
        });

    const quizAttempts = await QuizAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(12)
        .populate({
            path: 'quizId',
            select: 'title courseId',
            populate: { path: 'courseId', select: 'courseTitle' }
        });

    const lowQuizScores = quizAttempts
        .filter((attempt) => Number(attempt.percentage || 0) < 60)
        .slice(0, 3)
        .map((attempt) => ({
            topic: attempt.quizId?.title || attempt.quizId?.courseId?.courseTitle || 'Quiz topic',
            score: `${attempt.percentage || 0}%`,
            type: 'Quiz'
        }));

    const submissions = await AssignmentSubmission.find({ studentId: userId, status: 'graded' })
        .sort({ updatedAt: -1 })
        .limit(12)
        .populate({
            path: 'assignmentId',
            select: 'title totalMarks courseId',
            populate: { path: 'courseId', select: 'courseTitle' }
        });

    const lowAssignmentScores = submissions
        .filter((submission) => {
            const total = Number(submission.assignmentId?.totalMarks || 0);
            if (!total) return false;
            return ((submission.marksObtained || 0) / total) * 100 < 60;
        })
        .slice(0, 3)
        .map((submission) => ({
            topic: submission.assignmentId?.title || submission.assignmentId?.courseId?.courseTitle || 'Assignment topic',
            score: `${Math.round((((submission.marksObtained || 0) / (submission.assignmentId?.totalMarks || 1)) * 100))}%`,
            type: 'Assignment'
        }));

    const performanceData = {
        studentName: req.user.name,
        recentLowScores: [...lowQuizScores, ...lowAssignmentScores],
        incompleteChapters: buildIncompleteLectureHints(activeEnrollments)
    };

    const result = await detectWeaknesses(performanceData);
    if (!result.success) {
        // Graceful degradation: return a helpful fallback instead of crashing
        const fallback = performanceData.recentLowScores.length > 0
            ? `Based on your recent assessments, consider reviewing: ${performanceData.recentLowScores.map(s => s.topic).join(', ')}.`
            : 'Keep up the great work! No critical gaps detected in your recent performance.';
        return responseHelper.success(res, { analysis: fallback, aiUnavailable: true }, 'AI temporarily unavailable — showing local analysis');
    }

    return responseHelper.success(res, { analysis: result.text });
});

export const getStudyDirective = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const activeEnrollments = await Enrollment.find({ userId, status: 'active' })
        .populate('courseId', 'courseTitle');
    const courseIds = activeEnrollments.map((enrollment) => enrollment.courseId?._id).filter(Boolean);

    const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).select('_id courseId title');
    const quizIds = quizzes.map((quiz) => quiz._id);
    const attempts = await QuizAttempt.find({ userId, quizId: { $in: quizIds } }).select('quizId');
    const attemptedQuizIds = new Set(attempts.map((attempt) => String(attempt.quizId)));
    const pendingQuizzes = quizzes.filter((quiz) => !attemptedQuizIds.has(String(quiz._id)));

    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).select('title deadline courseId');
    const assignmentIds = assignments.map((assignment) => assignment._id);
    const submissions = await AssignmentSubmission.find({ studentId: userId, assignmentId: { $in: assignmentIds } }).select('assignmentId');
    const submittedAssignmentIds = new Set(submissions.map((submission) => String(submission.assignmentId)));
    const pendingAssignments = assignments.filter((assignment) => !submittedAssignmentIds.has(String(assignment._id)));

    const cohorts = await Cohort.find({ students: userId }).select('_id');
    const cohortIds = cohorts.map((cohort) => cohort._id);
    const upcomingSessions = await LiveSession.find({
        cohortId: { $in: cohortIds },
        startTime: { $gte: new Date() },
        sessionStatus: { $in: ['scheduled', 'live'] }
    })
        .sort({ startTime: 1 })
        .limit(3)
        .select('title startTime');

    const studentData = {
        name: req.user.name,
        activeCourses: activeEnrollments.length,
        overallProgress: `${average(activeEnrollments.map((enrollment) => Number(enrollment.progress || 0)))}%`,
        pendingAssignments: pendingAssignments.length,
        pendingQuizzes: pendingQuizzes.length,
        recentActivity: activeEnrollments
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3)
            .map((enrollment) => enrollment.courseId?.courseTitle)
            .filter(Boolean),
        upcomingSessions: upcomingSessions.map((session) => ({
            title: session.title,
            time: new Date(session.startTime).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit'
            })
        }))
    };

    const result = await getStudyPlan(studentData);
    if (!result.success) {
        // Graceful degradation: generate a basic directive from available data
        const parts = [`**${studentData.name}**, here's your current status:`];
        parts.push(`- **Active Courses:** ${studentData.activeCourses}`);
        parts.push(`- **Overall Progress:** ${studentData.overallProgress}`);
        if (studentData.pendingQuizzes > 0) parts.push(`- **Pending Quizzes:** ${studentData.pendingQuizzes}`);
        if (studentData.pendingAssignments > 0) parts.push(`- **Pending Assignments:** ${studentData.pendingAssignments}`);
        if (studentData.upcomingSessions?.length > 0) {
            parts.push(`- **Upcoming Sessions:** ${studentData.upcomingSessions.map(s => `${s.title} (${s.time})`).join(', ')}`);
        }
        parts.push('\n*AI analysis is temporarily unavailable. This is a summary of your current learning data.*');
        return responseHelper.success(res, { directive: parts.join('\n'), aiUnavailable: true }, 'AI temporarily unavailable — showing local data');
    }

    return responseHelper.success(res, { directive: result.text });
});

export const getFlashcards = asyncHandler(async (req, res, next) => {
    const { courseId, lectureId, lectureTitle, content } = req.body;
    const userId = req.user._id;

    // 1. Check for persisted cards
    const existing = await Flashcard.find({ userId, courseId, lectureId });
    if (existing.length > 0) {
        return responseHelper.success(res, { cards: existing }, "Knowledge cards recovered");
    }

    // 2. Generate new if not present
    const result = await generateFlashcardsForLesson(lectureTitle, content);
    if (!result.success) return next(new AppError(result.message || "Flashcard generation failed", 500));

    // 3. Persist (Approved Decision)
    const cardsToSave = result.data.map(c => ({
        userId, courseId, lectureId, question: c.question, answer: c.answer
    }));
    const saved = await Flashcard.insertMany(cardsToSave);

    return responseHelper.success(res, { cards: saved }, "Neural flashcards synthesized and persisted");
});

export const interviewInteraction = asyncHandler(async (req, res, next) => {
    const { moduleTitle, history, input } = req.body;
    if (!moduleTitle) return next(new AppError("Module title required for viva simulation", 400));

    const result = await conductMockInterview(moduleTitle, history || [], input);
    if (!result.success) return next(new AppError("Interview simulation failed", 500));

    return responseHelper.success(res, { text: result.text }, "Viva synapse active");
});

export const saveInterviewFeedback = asyncHandler(async (req, res, next) => {
    const { courseId, moduleTitle, transcript, overallScore, strengths, weaknesses, suggestions } = req.body;
    const userId = req.user._id;

    if (!courseId || !transcript) return next(new AppError("Incomplete interview artifact recorded", 400));

    const feedback = await InterviewFeedback.create({
        userId,
        courseId,
        moduleTitle,
        transcript,
        overallScore,
        strengths,
        weaknesses,
        suggestions
    });

    return responseHelper.success(res, { feedback }, "Viva performance archived securely");
});

export const getAllUserFlashcards = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const cards = await Flashcard.find({ userId }).populate('courseId', 'courseTitle');
    return responseHelper.success(res, { cards }, "Neural card registry synchronized");
});

export const deleteFlashcards = asyncHandler(async (req, res, next) => {
    const { courseId, lectureId } = req.params;
    const userId = req.user._id;

    await Flashcard.deleteMany({ userId, courseId, lectureId });
    return responseHelper.success(res, {}, "Flashcards cleared for regeneration");
});

export const getUserInterviewHistory = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const history = await InterviewFeedback.find({ userId })
        .populate('courseId', 'courseTitle')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { history }, "Viva performance history synchronized");
});

