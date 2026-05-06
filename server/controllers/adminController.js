import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import WalletTransaction from '../models/WalletTransaction.js';
import CertificateTemplate from '../models/CertificateTemplate.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as pusherService from '../services/pusherService.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';


export const getDashboardStats = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    
    const [userStats, courseStats, totalEnrollments, revenueStats, dailyRevenue, dailyUsers, topCourses, topInstructorsData, recentActivityData] = await Promise.all([
            
            User.aggregate([
                {
                    $facet: {
                        totalUsers: [{ $count: "count" }],
                        totalStudents: [{ $match: { role: 'student' } }, { $count: "count" }],
                        totalInstructors: [{ $match: { role: 'instructor' } }, { $count: "count" }],
                        pendingInstructors: [{ $match: { role: 'instructor', isApproved: false } }, { $count: "count" }],
                        activeUsers: [{ $match: { lastActive: { $gte: sevenDaysAgo } } }, { $count: "count" }]
                    }
                }
            ]),
            // Course Metrics
            Course.aggregate([
                {
                    $facet: {
                        totalCourses: [{ $count: "count" }],
                        pendingCourses: [{ $match: { status: 'pending' } }, { $count: "count" }]
                    }
                }
            ]),
            Enrollment.countDocuments(),
            // Fiscal Intelligence
            WalletTransaction.aggregate([
                { $match: { source: { $in: ['instructor_earnings', 'admin_commission', 'course_purchase'] }, status: 'success' } },
                {
                    $facet: {
                        totalRevenue: [{ $group: { _id: null, sum: { $sum: "$amount" } } }],
                        todayRevenue: [
                            { $match: { createdAt: { $gte: startOfToday } } },
                            { $group: { _id: null, sum: { $sum: "$amount" } } }
                        ]
                    }
                }
            ]),
            // Growth Matrix: Revenue
            WalletTransaction.aggregate([
                { $match: { source: 'course_purchase', status: 'success', createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$amount" }
                    }
                }
            ]),
            // Growth Matrix: Users
            User.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Performance Leaders: Courses
            Enrollment.aggregate([
                { $group: { _id: "$courseId", enrollments: { $sum: 1 } } },
                { $sort: { enrollments: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "_id",
                        as: "course"
                    }
                },
                { $unwind: "$course" },
                {
                    $project: {
                        title: "$course.courseTitle",
                        enrollments: 1,
                        revenue: { $multiply: ["$enrollments", "$course.coursePrice"] }
                    }
                }
            ]),
            // Performance Leaders: Instructors
            Course.aggregate([
                {
                    $lookup: {
                        from: "enrollments",
                        localField: "_id",
                        foreignField: "courseId",
                        as: "enrollments"
                    }
                },
                {
                    $project: {
                        instructor: 1,
                        revenue: { $multiply: [{ $size: "$enrollments" }, "$coursePrice"] }
                    }
                },
                {
                    $group: {
                        _id: "$instructor",
                        totalRevenue: { $sum: "$revenue" }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        name: "$user.name",
                        email: "$user.email",
                        revenue: "$totalRevenue"
                    }
                }
            ]),
            // Recent Activity Matrix
            Promise.all([
                User.find({}).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
                Enrollment.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('courseId', 'courseTitle'),
                WalletTransaction.find({ status: 'success' }).sort({ createdAt: -1 }).limit(5).populate('userId', 'name')
            ])
        ]);

        const activityMatrix = [
            ...recentActivityData[0].map(u => ({ id: u._id, type: 'USER', title: 'New Scholar Ingress', detail: u.name, time: u.createdAt })),
            ...recentActivityData[1].map(e => ({ id: e._id, type: 'ENROLLMENT', title: 'Curriculum Acquisition', detail: `${e.userId?.name || 'Scholar'} → ${e.courseId?.courseTitle || 'Curriculum'}`, time: e.createdAt })),
            ...recentActivityData[2].map(t => ({ id: t._id, type: 'TRANSACTION', title: 'Fiscal Flux', detail: `₹${t.amount} | ${t.userId?.name || 'Nexus'}`, time: t.createdAt }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);


        // Map growth matrix to 7-day structure
        const dailyGrowth = [];
        const dailyRevenueMap = Object.fromEntries(dailyRevenue.map(r => [r._id, r.revenue]));
        const dailyUsersMap = Object.fromEntries(dailyUsers.map(u => [u._id, u.count]));

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            dailyGrowth.push({
                name: date.toLocaleString('default', { weekday: 'short' }),
                revenue: dailyRevenueMap[dateStr] || 0,
                users: dailyUsersMap[dateStr] || 0
            });
        }

        const stats = {
            totalUsers: userStats[0].totalUsers[0]?.count || 0,
            activeUsers: userStats[0].activeUsers[0]?.count || 0,
            totalStudents: userStats[0].totalStudents[0]?.count || 0,
            totalInstructors: userStats[0].totalInstructors[0]?.count || 0,
            totalCourses: courseStats[0].totalCourses[0]?.count || 0,
            totalEnrollments,
            totalRevenue: revenueStats[0].totalRevenue[0]?.sum || 0,
            todayRevenue: revenueStats[0].todayRevenue[0]?.sum || 0,
            pendingCourses: courseStats[0].pendingCourses[0]?.count || 0,
            pendingInstructors: userStats[0].pendingInstructors[0]?.count || 0,
            growthTimeSeries: dailyGrowth,
            recentActivity: activityMatrix,
            topPerformers: {
                topCourses,
                topInstructors: topInstructorsData
            }
        };

    return responseHelper.success(res, { stats }, 'Platform intelligence synchronized');
});

// Get All Users (with institutional pagination)
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const { role, page = 1, limit = 10 } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    return responseHelper.success(res, { 
        users, 
        pagination: { total, pages: Math.ceil(total / limit), currentPage: parseInt(page) }
    }, 'Registry synchronized');
});

// Get User By ID (Detailed Profile)
export const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
        return next(new AppError('Identity not found in repository.', 404));
    }
    return responseHelper.success(res, { user });
});

// Create User
export const createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Institutional email already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name, email, password: hashedPassword, role,
        isApproved: true
    });

    return responseHelper.success(res, { user: { ...user.toObject(), password: undefined } }, 'New identity provisioned', 201);
});

// Update User
export const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, role, isApproved } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isApproved !== undefined) updateData.isApproved = isApproved;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
        return next(new AppError('Identity synchronization failed', 404));
    }

    return responseHelper.success(res, { user }, 'Identity records updated');
});

// Delete User
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return next(new AppError('Identity decompression failed: Not found', 404));
    }
    return responseHelper.success(res, {}, 'Identity permanently purged');
});

// Get All Instructors (with institutional pagination)
export const getAllInstructors = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const instructors = await User.find({ role: 'instructor' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await User.countDocuments({ role: 'instructor' });
    return responseHelper.success(res, { 
        instructors, 
        pagination: { total, pages: Math.ceil(total / limit), currentPage: parseInt(page) }
    }, 'Educator list synchronized');
});

// Approve/Reject Instructor
export const approveInstructor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { isApproved } = req.body;

    const instructor = await User.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
    ).select('-password');

    if (!instructor) {
        return next(new AppError('Educator identity not found', 404));
    }

    // Real-time Relay: Alert Educator of Authorization State
    await pusherService.broadcast(`user-${id}`, 'authorization-update', {
        status: isApproved ? 'APPROVED' : 'REVOKED',
        message: isApproved ? 'Your scholarly credentials have been authorized.' : 'Your educator privileges have been suspended.',
        type: 'IDENTITY'
    });

    return responseHelper.success(res, { instructor }, isApproved ? 'Instructor authorized' : 'Instructor credentials revoked');
});

// Get All Courses (Admin)
export const getAllCoursesAdmin = asyncHandler(async (req, res, next) => {
    const { category } = req.query;

    let query = {};
    if (category && category !== 'null' && category !== 'undefined' && category !== '') {
        try {
            query.category = new mongoose.Types.ObjectId(category);
        } catch (err) {
            // Silently fail if ID is malformed
        }
    }

    const courses = await Course.find(query)
        .populate('instructor', 'name email')
        .populate('category', 'name')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { courses }, 'Registry synchronized');
});

// Approve/Reject Course
// Approve/Reject Course
export const updateCourseStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return next(new AppError('Invalid curriculum status transition', 400));
    }

    const course = await Course.findByIdAndUpdate(id, { status }, { new: true }).populate('instructor', 'name');
    if (!course) {
        return next(new AppError('Curriculum component not found', 404));
    }

    // Real-time Relay: Alert Instructor of Course Lifecycle State
    await pusherService.broadcast(`user-${course.instructor._id}`, 'course-status-update', {
        courseTitle: course.courseTitle,
        status: status.toUpperCase(),
        message: `Your course "${course.courseTitle}" has been ${status}.`
    });

    return responseHelper.success(res, { course }, `Curriculum status recalibrated to ${status.toUpperCase()}`);
});

// Update Course (Full Admin Access)
export const updateCourseAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { courseData } = req.body;
    const imageFile = req.file;

    const course = await Course.findById(id);
    if (!course) {
        return next(new AppError('Curriculum component not found', 404));
    }

    const parsedData = JSON.parse(courseData);
    Object.assign(course, parsedData);

    if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        course.courseThumbnail = imageUpload.secure_url;
    }

    await course.save();
    return responseHelper.success(res, { course }, 'Curriculum synchronized perfectly by Admin');
});

// Delete Course (Admin)
export const deleteCourseAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    await Enrollment.deleteMany({ courseId: id });
    return responseHelper.success(res, {}, 'Curriculum permanently decommissioned');
});

// Create Category
export const createCategory = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
        return next(new AppError('Topic taxonomy already exists', 400));
    }
    const category = await Category.create({ name, description });
    return responseHelper.success(res, { category }, 'Topic taxonomy created', 201);
});

// Update Category
export const updateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
        id, { name, description }, { new: true }
    );
    if (!category) {
        return next(new AppError('Topic taxonomy not found', 404));
    }
    return responseHelper.success(res, { category }, 'Topic taxonomy synchronized');
});

// Delete Category
export const deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    return responseHelper.success(res, {}, 'Topic taxonomy purged');
});

// Get Global Scholar Mastery Data (Reports)
export const getScholarPerformance = asyncHandler(async (req, res, next) => {
    const performanceData = await User.aggregate([
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
                        { $divide: [{ $sum: "$attempts.score" }, { $size: "$attempts" }] },
                        0
                    ]
                }
            }
        },
        
        { $project: { name: 1, email: 1, completion: { $round: ["$completion", 0] }, avgScore: { $round: ["$avgScore", 0] } } },
        { $sort: { avgScore: -1 } }
    ]);

    return responseHelper.success(res, {
        performance: performanceData
    }, 'Global academic performance synchronized');
});

// ─── Instructor Payout Management ────────────────────────────────────
export const getAllPayouts = asyncHandler(async (req, res, next) => {
    const { instructor, status, startDate, endDate } = req.query;
    let query = { source: 'withdrawal' };

    if (instructor && instructor !== 'undefined') query.userId = instructor;
    if (status && status !== 'undefined') query.status = status;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payouts = await WalletTransaction.find(query)
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { payouts }, 'Payout ledger synchronized');
});

export const updatePayoutStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['success', 'failed'].includes(status)) {
        return next(new AppError('Invalid fiscal status transition.', 400));
    }

    const payout = await WalletTransaction.findByIdAndUpdate(id, { status }, { new: true })
        .populate('userId', 'name email');

    if (!payout) {
        return next(new AppError('Fiscal payout record not found.', 404));
    }

    // Real-time Relay: Alert Instructor of Financial State Transition
    await pusherService.broadcast(`user-${payout.userId._id}`, 'payout-status-update', {
        amount: payout.amount,
        status: status.toUpperCase(),
        message: `Your payout request for ${payout.amount} has been ${status === 'success' ? 'authorized and processed.' : 'rejected by administration.'}`
    });

    return responseHelper.success(res, { payout }, `Fiscal payout marked as ${status}`);
});

// Get All Enrollments (Admin Ledger)
export const getAllEnrollmentsAdmin = asyncHandler(async (req, res, next) => {
    const enrollments = await Enrollment.find({})
        .populate('userId', 'name email')
        .populate('courseId', 'courseTitle')
        .sort({ createdAt: -1 });

    const formattedEnrollments = enrollments.map(e => ({
        id: e._id,
        student: e.userId?.name || 'Unknown Scholar',
        course: e.courseId?.courseTitle || 'Unknown Curriculum',
        status: e.status || 'Enrolled',
        date: new Date(e.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).toUpperCase()
    }));

    return responseHelper.success(res, { enrollments: formattedEnrollments }, 'Academic ledger synchronized');
});



// --- Certificate Templates (Admin) ---

export const getCertificateTemplates = asyncHandler(async (req, res, next) => {
    const templates = await CertificateTemplate.find().sort({ createdAt: -1 });
    return responseHelper.success(res, { templates }, 'Certificate blueprints synchronized');
});

export const createCertificateTemplate = asyncHandler(async (req, res, next) => {
    const { title, htmlContent, cssContent, backgroundImage, fontSize, fontFamily, isDefault } = req.body;

    if (isDefault) {
        await CertificateTemplate.updateMany({}, { isDefault: false });
    }

    const template = await CertificateTemplate.create({
        title, htmlContent, cssContent, backgroundImage, fontSize, fontFamily, isDefault
    });

    return responseHelper.success(res, { template }, 'Certificate blueprint created', 201);
});

export const updateCertificateTemplate = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.isDefault) {
        await CertificateTemplate.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    const template = await CertificateTemplate.findByIdAndUpdate(id, updateData, { new: true });
    if (!template) return next(new AppError('Blueprint not found', 404));

    return responseHelper.success(res, { template }, 'Blueprint synchronized');
});

export const deleteCertificateTemplate = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await CertificateTemplate.findByIdAndDelete(id);
    return responseHelper.success(res, {}, 'Blueprint permanently decommissioned');
});
