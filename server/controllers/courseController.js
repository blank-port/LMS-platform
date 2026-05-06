import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { performEnrollment } from "../services/enrollmentService.js";
import { grantPoints } from "../services/gamificationService.js";
import asyncHandler from "../utils/asyncHandler.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";

// Get All Published & Approved Courses (Paginated)
export const getAllCourses = asyncHandler(async (req, res, next) => {
    console.log(`[Course Controller] GET /all - Request received at ${new Date().toISOString()}`);
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { isPublished: true, status: 'approved' };
    
    const [courses, total] = await Promise.all([
        Course.find(filter)
            .select(['-courseContent', '-enrolledStudents', '-courseDescription', '-courseOutcomes', '-courseRequirements', '-courseRatings', '-certificateTemplate'])
            .populate({ path: 'instructor', select: 'name profilePicture' })
            .populate({ path: 'category', select: 'name' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Course.countDocuments(filter)
    ]);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { courses }, 'Course catalog synchronized', 200, meta);
});

// Get Course By Id
export const getCourseById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const courseData = await Course.findById(id)
        .populate({ path: 'instructor', select: 'name profilePicture email headline about socialLinks' })
        .populate({ path: 'category', select: 'name' });

    if (!courseData) {
        return next(new AppError('Course artifact not found', 404));
    }

    // Remove lectureUrl if isPreviewFree is false (for non-enrolled users)
    const courseObj = courseData.toObject();
    if (courseObj.courseContent && Array.isArray(courseObj.courseContent)) {
        courseObj.courseContent.forEach(chapter => {
            if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                chapter.chapterContent.forEach(lecture => {
                    if (lecture && !lecture.isPreviewFree) {
                        lecture.lectureUrl = "";
                    }
                });
            }
        });
    }

    return responseHelper.success(res, { courseData: courseObj }, 'Course intelligence synchronized');
});

// Search Courses
export const searchCourses = asyncHandler(async (req, res, next) => {
    const { query, category } = req.query;
    let filter = { isPublished: true, status: 'approved' };

    if (query) {
        filter.$text = { $search: query };
    }

    if (category) {
        filter.category = category;
    }

    let coursesQuery = Course.find(filter)
        .select(['-courseContent', '-enrolledStudents'])
        .populate({ path: 'instructor', select: 'name profilePicture' })
        .populate({ path: 'category', select: 'name' });

    if (query) {
        coursesQuery = coursesQuery
            .select({ score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } });
    } else {
        coursesQuery = coursesQuery.sort({ createdAt: -1 });
    }

    const courses = await coursesQuery;
    return responseHelper.success(res, { courses }, 'Search results synchronized');
});

// Enroll in Course
export const enrollCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('Course artifact not found', 404));
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
        return next(new AppError('Strategic identity already enrolled in this curriculum', 400));
    }

    // Atomic Wallet Deduction
    if (course.coursePrice > 0) {
        const user = await User.findOneAndUpdate(
            { _id: userId, walletBalance: { $gte: course.coursePrice } },
            { $inc: { walletBalance: -course.coursePrice } },
            { new: true }
        );

        if (!user) {
            return next(new AppError('Fiscal credentials insufficient for curriculum enrollment', 400));
        }
        
        // Log transaction
        const WalletTransaction = (await import('../models/WalletTransaction.js')).default;
        await WalletTransaction.create({
            userId,
            amount: course.coursePrice,
            type: 'debit',
            description: `Enrollment: ${course.courseTitle}`,
            source: 'course_purchase',
            status: 'success'
        });
    }

    // Enroll via Unified Service
    const enrollResult = await performEnrollment({
        userId,
        courseId,
        amount: course.coursePrice > 0 ? course.coursePrice : 0,
        paymentMethod: 'direct_enroll',
        paymentId: null
    });

    if (!enrollResult.success) {
        return next(new AppError(enrollResult.message || 'Enrollment lifecycle failure', 500));
    }

    return responseHelper.success(res, {}, 'Scholar enrollment synchronized successfully');
});

// Get Enrolled Courses
export const getEnrolledCourses = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const enrollments = await Enrollment.find({ userId })
        .populate({
            path: 'courseId',
            populate: [
                { path: 'instructor', select: 'name profilePicture' },
                { path: 'category', select: 'name' }
            ]
        });

    return responseHelper.success(res, { enrollments }, 'Personal curriculum registry synchronized');
});

// Update Course Progress & Last Watched
export const updateCourseProgress = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { courseId, lessonId, lastWatchedTime, markAsComplete } = req.body;

    let enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
        return next(new AppError('No active enrollment found for this artifact', 404));
    }

    // Update tracking info
    if (lessonId) {
        enrollment.lastWatchedLessonId = lessonId;
    }
    if (lastWatchedTime !== undefined) {
        enrollment.lastWatchedTime = lastWatchedTime;
    }

    // Mark lesson as complete if requested
    if (markAsComplete && lessonId && !enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId).select('courseContent');
    let totalLessons = 0;
    course.courseContent.forEach(ch => {
        totalLessons += ch.chapterContent.length;
    });

    // Track whether the course was already completed BEFORE this update
    const wasAlreadyCompleted = enrollment.completed;

    enrollment.progress = totalLessons > 0
        ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
        : 0;
    enrollment.completed = enrollment.progress === 100;

    await enrollment.save();

    // Gamification hooks
    if (markAsComplete && lessonId) {
        await grantPoints(userId, 'unit_complete', { referenceId: lessonId });
    }

    // Only fire course_complete on the FIRST completion (not on every subsequent progress sync)
    const justCompleted = !wasAlreadyCompleted && enrollment.completed;
        
    if (justCompleted) {
        await grantPoints(userId, 'course_complete', { referenceId: courseId });
        
        // Dispatch Congratulatory Dispatch
        const { sendCourseCompletionEmail } = await import('../services/emailService.js');
        const user = await User.findById(userId);
        const courseData = await Course.findById(courseId);
        if (user && courseData) {
            await sendCourseCompletionEmail(user.email, user.name, courseData.courseTitle);
        }

        // Check for completion-based certificate issuance
        if (courseData && courseData.issueMethod === 'completion') {
            const { issueAutomatedCertificate } = await import('./certificateController.js');
            await issueAutomatedCertificate(userId, courseId);
        }
    }

    return responseHelper.success(res, { enrollment }, 'Pedagogical progress synchronized');
});

// Get Course Progress
export const getCourseProgress = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    return responseHelper.success(res, { enrollment }, 'Curriculum progress synchronized');
});

// Get All Categories
export const getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find().sort({ name: 1 });
    return responseHelper.success(res, { categories }, 'Category registry synchronized');
});

// Get Course with full content (for enrolled students, instructors, and admins)
export const getCourseFullContent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(id)
        .populate({ path: 'instructor', select: 'name profilePicture email' })
        .populate({ path: 'category', select: 'name' });

    if (!course) {
        return next(new AppError('Course artifact not found', 404));
    }

    // Verify enrollment or instructor/admin status
    const enrollment = await Enrollment.findOne({ userId, courseId: id });
    const isInstructor = course.instructor && course.instructor._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!enrollment && !isInstructor && !isAdmin) {
        return next(new AppError('Institutional authorization required for full access', 403));
    }

    return responseHelper.success(res, { courseData: course, enrollment }, 'Comprehensive curriculum intelligence synchronized');
});

// Curriculum Popularity & Efficacy Stats
export const getPopularityStats = asyncHandler(async (req, res, next) => {
    const courses = await Course.find({ isPublished: true, status: 'approved' })
        .select('courseTitle enrolledStudents averageRating')
        .sort({ 'enrolledStudents.length': -1 });

    const stats = courses.map(course => ({
        courseTitle: course.courseTitle,
        enrolledCount: course.enrolledStudents.length,
        averageRating: course.averageRating || 0
    }));

    return responseHelper.success(res, { stats }, 'Curriculum popularity metrics synchronized');
});