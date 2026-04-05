import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { performEnrollment } from "../services/enrollmentService.js";
import { grantPoints } from "../services/gamificationService.js";

// Get All Published & Approved Courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true, status: 'approved' })
            .select(['-courseContent', '-enrolledStudents', '-courseDescription', '-courseOutcomes', '-courseRequirements', '-courseRatings', '-certificateTemplate'])
            .populate({ path: 'instructor', select: 'name profilePicture' })
            .populate({ path: 'category', select: 'name' })
            .sort({ createdAt: -1 });

        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Course By Id
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Fetching course by ID: "${id}"`);
        const courseData = await Course.findById(id)
            .populate({ path: 'instructor', select: 'name profilePicture email' })
            .populate({ path: 'category', select: 'name' });

        if (!courseData) {
            return res.status(404).json({ success: false, message: 'Course not found' });
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

        res.json({ success: true, courseData: courseObj });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Search Courses
export const searchCourses = async (req, res) => {
    try {
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

        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Enroll in Course
export const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        // Check if course is free or user can pay via wallet
        if (course.coursePrice > 0) {
            const user = await User.findById(userId);
            if (user.walletBalance < course.coursePrice) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient wallet balance. Course costs ₹${course.coursePrice}, but you have ₹${user.walletBalance}.` 
                });
            }
            
            // Deduct from wallet
            user.walletBalance -= course.coursePrice;
            await user.save();
            
            // Log transaction (Optional: Add WalletTransaction record here if needed)
            const WalletTransaction = (await import('../models/WalletTransaction.js')).default;
            await WalletTransaction.create({
                userId,
                amount: -course.coursePrice,
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
            return res.json(enrollResult);
        }

        res.json({ success: true, message: 'Enrolled successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Courses
export const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user._id;
        const enrollments = await Enrollment.find({ userId })
            .populate({
                path: 'courseId',
                populate: [
                    { path: 'instructor', select: 'name profilePicture' },
                    { path: 'category', select: 'name' }
                ]
            });

        res.json({ success: true, enrollments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Course Progress & Last Watched
export const updateCourseProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId, lessonId, lastWatchedTime, markAsComplete } = req.body;

        let enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
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

        enrollment.progress = totalLessons > 0
            ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
            : 0;
        enrollment.completed = enrollment.progress === 100;

        await enrollment.save();

        // Gamification hooks
        if (markAsComplete && lessonId) {
            await grantPoints(userId, 'unit_complete');
        }

        if (enrollment.completed && enrollment.progress === 100) {
            await grantPoints(userId, 'course_complete');
            
            // Check for completion-based certificate issuance
            const courseData = await Course.findById(courseId);
            if (courseData && courseData.issueMethod === 'completion') {
                const { issueAutomatedCertificate } = await import('./certificateController.js');
                await issueAutomatedCertificate(userId, courseId);
            }
        }

        res.json({ success: true, message: 'Progress updated', enrollment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Course Progress
export const getCourseProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({ userId, courseId });
        res.json({ success: true, enrollment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Course with full content (for enrolled students)
export const getCourseFullContent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Verify enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId: id });
        if (!enrollment) {
            return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
        }

        const course = await Course.findById(id)
            .populate({ path: 'instructor', select: 'name profilePicture email' })
            .populate({ path: 'category', select: 'name' });

        res.json({ success: true, courseData: course, enrollment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Curriculum Popularity & Efficacy Stats
export const getPopularityStats = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true, status: 'approved' })
            .select('courseTitle enrolledStudents averageRating')
            .sort({ 'enrolledStudents.length': -1 });

        const stats = courses.map(course => ({
            courseTitle: course.courseTitle,
            enrolledCount: course.enrolledStudents.length,
            averageRating: course.averageRating || 0
        }));

        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};