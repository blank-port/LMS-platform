import Payment from "../models/Payment.js";
import Refund from "../models/Refund.js";
import Badge from "../models/Badge.js";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import WalletTransaction from "../models/WalletTransaction.js";
import mongoose from "mongoose";
import { createStudentNotification } from "../services/notificationService.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Financials
export const getAdminRevenue = asyncHandler(async (req, res, next) => {
    const stats = await WalletTransaction.aggregate([
        { $match: { status: 'success', type: 'credit' } },
        {
            $group: {
                _id: "$source",
                total: { $sum: "$amount" }
            }
        }
    ]);

    const statsMap = Object.fromEntries(stats.map(s => [s._id, s.total]));
    
    const totalRevenue = (statsMap['instructor_earnings'] || 0) + (statsMap['admin_commission'] || 0);
    const adminShare = statsMap['admin_commission'] || 0;
    const instructorShare = statsMap['instructor_earnings'] || 0;

    // Breakdown by course
    const courseStats = await WalletTransaction.aggregate([
        { $match: { status: 'success', type: 'credit', source: { $in: ['instructor_earnings', 'admin_commission'] } } },
        {
            $group: {
                _id: "$metadata.courseId",
                revenue: { $sum: "$amount" }
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo"
            }
        },
        { $unwind: "$courseInfo" },
        {
            $project: {
                title: "$courseInfo.courseTitle",
                enrollments: { $size: "$courseInfo.enrolledStudents" },
                revenue: 1
            }
        }
    ]);

    return responseHelper.success(res, {
        revenue: totalRevenue,
        report: {
            totalRevenue,
            adminShare,
            instructorShare,
            courseBreakdown: courseStats
        }
    }, 'Fiscal revenue ledger synchronized');
});

export const getInstructorRevenue = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const instructorId = id || req.user._id;

    const stats = await WalletTransaction.aggregate([
        { 
            $match: { 
                userId: new mongoose.Types.ObjectId(instructorId),
                status: 'success', 
                type: 'credit',
                source: 'instructor_earnings'
            } 
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ]);

    const totalRevenue = stats[0]?.totalRevenue || 0;

    const courseBreakdown = await WalletTransaction.aggregate([
        { 
            $match: { 
                userId: new mongoose.Types.ObjectId(instructorId),
                status: 'success', 
                type: 'credit',
                source: 'instructor_earnings'
            } 
        },
        {
            $group: {
                _id: "$metadata.courseId",
                revenue: { $sum: "$amount" }
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo"
            }
        },
        { $unwind: "$courseInfo" },
        {
            $project: {
                title: "$courseInfo.courseTitle",
                enrollments: { $size: "$courseInfo.enrolledStudents" },
                revenue: 1
            }
        }
    ]);

    return responseHelper.success(res, {
        report: {
            totalRevenue,
            instructorShare: totalRevenue,
            adminShare: 0, // Admin share is not credited to instructor wallet
            courseBreakdown
        }
    }, 'Instructor revenue report synchronized');
});

export const getPayments = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find()
        .populate('user', 'name email')
        .populate('course', 'courseTitle')
        .sort({ createdAt: -1 });

    const mappedData = payments.map(p => ({
        id: p._id,
        user: p.user?.name || 'Anonymous',
        course: p.course?.courseTitle || 'System Asset',
        amount: p.amount,
        status: p.status,
        date: new Date(p.createdAt).toLocaleDateString()
    }));

    return responseHelper.success(res, { data: mappedData }, 'Payment ledger synchronized');
});

export const getRefunds = asyncHandler(async (req, res, next) => {
    const refunds = await Refund.find()
        .populate('user', 'name email')
        .populate('course', 'courseTitle')
        .sort({ createdAt: -1 });

    const mappedData = refunds.map(r => ({
        id: r._id,
        user: r.user?.name || 'Anonymous',
        course: r.course?.courseTitle || 'Curriculum Unit', 
        amount: r.amount || 0,
        status: r.status,
        date: new Date(r.createdAt).toLocaleDateString()
    }));

    return responseHelper.success(res, { data: mappedData }, 'Refund requests ledger synchronized');
});

// Admin: Approve Refund
export const approveRefund = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const refund = await Refund.findById(id).populate('course');
    
    if (!refund) return next(new AppError('Institutional refund record not found', 404));
    if (refund.status !== 'requested') return next(new AppError('Institutional refund protocol already processed', 400));

    refund.status = 'approved';
    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    await refund.save();

    // Invalidate enrollment
    await Enrollment.findOneAndUpdate(
        { userId: refund.user, courseId: refund.course },
        { status: 'refunded' }
    );

    // Notify Student
    await createStudentNotification({
        userId: refund.user,
        type: 'REFUND_REPLY',
        message: `Your refund for "${refund.course?.courseTitle || 'Curriculum'}" has been APPROVED. The credits will be reversed shortly.`,
        module: 'ecommerce',
        referenceId: refund._id
    });

    return responseHelper.success(res, {}, 'Institutional refund authorized and balance updated');
});

// Admin: Reject Refund
export const rejectRefund = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;
    const refund = await Refund.findById(id).populate('course');

    if (!refund) return next(new AppError('Institutional refund record not found', 404));

    refund.status = 'rejected';
    refund.adminMessage = reason;
    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    await refund.save();

    // Notify Student
    await createStudentNotification({
        userId: refund.user,
        type: 'REFUND_REPLY',
        message: `Your refund request for "${refund.course?.courseTitle || 'Curriculum'}" was REJECTED: ${reason || 'Does not meet criteria'}`,
        module: 'ecommerce',
        referenceId: refund._id
    });

    return responseHelper.success(res, {}, 'Institutional refund credentials rejected');
});

// Student: Request Refund
export const studentRequestRefund = asyncHandler(async (req, res, next) => {
    const { courseId, paymentId, reason } = req.body;
    
    // Strategy: Verify active enrollment exists
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId, status: 'active' });
    if (!enrollment) {
        return next(new AppError('Institutional Record: No active scholarly enrollment found for this sector', 400));
    }

    const refund = await Refund.create({
        user: req.user._id,
        course: courseId,
        payment: paymentId,
        reason,
        status: 'requested'
    });

    return responseHelper.success(res, { refund }, 'Refund request protocols initiated');
});

// Student: Get personal refund history
export const getStudentRefunds = asyncHandler(async (req, res, next) => {
    const refunds = await Refund.find({ user: req.user._id })
        .populate('course', 'courseTitle')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { refunds }, 'Personal refund registry synchronized');
});

// Gamification
export const awardBadge = asyncHandler(async (req, res, next) => {
    const { userId, badgeId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $addToSet: { badges: badgeId } }, { new: true });
    if (!user) return next(new AppError('Identity not found in repository', 404));
    return responseHelper.success(res, {}, 'Institutional badge awarded successfully');
});

export const debugPayments = asyncHandler(async (req, res, next) => {
    const count = await Payment.countDocuments();
    const all = await Payment.find();
    return responseHelper.success(res, { count, all }, 'Fiscal debug protocols synchronized');
});

// Payout Settings
export const getPayoutSettings = asyncHandler(async (req, res, next) => {
    const keys = ['instructorCommission', 'minimumPayoutAmount', 'payoutFrequency', 'enableAutoPayout', 'paymentMethods'];
    const settings = await Setting.find({ key: { $in: keys } });
    
    const settingsMap = {};
    settings.forEach(s => {
        // Handle array vs value
        if (s.key === 'paymentMethods') {
            settingsMap[s.key] = s.value.split(',');
        } else if (s.key === 'enableAutoPayout') {
            settingsMap[s.key] = s.value === 'true';
        } else {
            settingsMap[s.key] = isNaN(s.value) ? s.value : Number(s.value);
        }
    });

    // Default values if not found
    const finalSettings = {
        instructorCommission: settingsMap.instructorCommission ?? 70,
        minimumPayoutAmount: settingsMap.minimumPayoutAmount ?? 500,
        payoutFrequency: settingsMap.payoutFrequency ?? 'monthly',
        enableAutoPayout: settingsMap.enableAutoPayout ?? false,
        paymentMethods: settingsMap.paymentMethods ?? ['bank', 'paypal', 'stripe']
    };

    return responseHelper.success(res, { settings: finalSettings }, 'Remuneration protocols synchronized');
});

export const updatePayoutSettings = asyncHandler(async (req, res, next) => {
    const settings = req.body;
    const keys = Object.keys(settings);

    await Promise.all(keys.map(async (key) => {
        let value = settings[key];
        if (Array.isArray(value)) value = value.join(',');
        
        await Setting.findOneAndUpdate(
            { key },
            { key, value, isSensitive: false },
            { upsert: true, new: true }
        );
    }));

    return responseHelper.success(res, {}, 'Remuneration policies synchronized');
});

// Refund Settings
export const getRefundSettings = asyncHandler(async (req, res, next) => {
    const keys = ['enableRefunds', 'refundWindowDays', 'cancellationFee', 'automaticRefundApproval', 'refundTerms'];
    const settings = await Setting.find({ key: { $in: keys } });
    
    const settingsMap = {};
    settings.forEach(s => {
        if (s.key === 'enableRefunds' || s.key === 'automaticRefundApproval') {
            settingsMap[s.key] = s.value === 'true';
        } else if (s.key === 'refundWindowDays' || s.key === 'cancellationFee') {
            settingsMap[s.key] = Number(s.value);
        } else {
            settingsMap[s.key] = s.value;
        }
    });

    const finalSettings = {
        enableRefunds: settingsMap.enableRefunds ?? true,
        refundWindowDays: settingsMap.refundWindowDays ?? 7,
        cancellationFee: settingsMap.cancellationFee ?? 0,
        automaticRefundApproval: settingsMap.automaticRefundApproval ?? false,
        refundTerms: settingsMap.refundTerms ?? 'Standard institutional refund protocols apply.'
    };

    return responseHelper.success(res, { settings: finalSettings }, 'Refund policies synchronized');
});

export const updateRefundSettings = asyncHandler(async (req, res, next) => {
    const settings = req.body;
    const keys = Object.keys(settings);

    await Promise.all(keys.map(async (key) => {
        await Setting.findOneAndUpdate(
            { key },
            { key, value: String(settings[key]), isSensitive: false },
            { upsert: true, new: true }
        );
    }));

    return responseHelper.success(res, {}, 'Refund configurations synchronized');
});
