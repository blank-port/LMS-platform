import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Notification from "../models/Notification.js";
import Coupon from "../models/Coupon.js";
import { performEnrollment } from "../services/enrollmentService.js";
import { grantPoints } from "../services/gamificationService.js";
import { createAdminNotification, createStudentNotification } from "../services/notificationService.js";
import { getRazorpayInstance } from "../utils/razorpay.js";
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get Pending Payments (Centralized Fiscal Oversight)
export const getPendingPayments = asyncHandler(async (req, res, next) => {
    const { method = 'all' } = req.query;
    let query = { status: { $in: ['pending', 'pending_approval'] } };

    if (method !== 'all') {
        query.paymentMethod = method;
    }

    const payments = await Payment.find(query)
        .populate('user', 'name email avatar')
        .populate('course', 'courseTitle courseThumbnail')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { payments }, 'Fiscal ledger synchronized');
});


// Helper: Process Commission Split
const processCommissionSplit = async (paymentId, courseId, amount) => {
    const course = await Course.findById(courseId);
    const globalCommSetting = await Setting.findOne({ key: 'global_commission_percentage' });
    
    const commissionPercent = course.commissionRate > 0 ? course.commissionRate : (globalCommSetting ? globalCommSetting.value : 20);
    
    const adminShare = (amount * commissionPercent) / 100;
    const instructorShare = amount - adminShare;

    // Credit Instructor Wallet
    const instructor = await User.findById(course.instructor);
    instructor.walletBalance += instructorShare;
    await instructor.save();

    // Log Instructor Earnings
    await WalletTransaction.create({
        userId: course.instructor,
        amount: instructorShare,
        type: 'credit',
        source: 'instructor_earnings',
        description: `Earnings for course: ${course.courseTitle}`,
        metadata: { courseId, paymentId }
    });

    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
        adminUser.walletBalance += adminShare;
        await adminUser.save();
        await WalletTransaction.create({
            userId: adminUser._id,
            amount: adminShare,
            type: 'credit',
            source: 'admin_commission',
            description: `Commission for course: ${course.courseTitle}`,
            metadata: { courseId, paymentId }
        });
    }
};

// Create Order (Razorpay)
export const createOrder = asyncHandler(async (req, res, next) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Target curriculum not found', 404));

    // Idempotency: Check if already pending or completed
    const existingPayment = await Payment.findOne({ user: userId, course: courseId, status: { $in: ['pending', 'completed'] } });
    if (existingPayment && existingPayment.status === 'completed') {
        return next(new AppError('Curriculum already unlocked for this identity', 400));
    }

    const amount = (course.coursePrice - (course.coursePrice * course.discount / 100)) * 100; // in paisa

    const razorpay = await getRazorpayInstance();
    if (!razorpay) {
        return next(new AppError('Institutional payment gateway standby. Please try again later.', 503));
    }

    const options = {
        amount: Math.round(amount),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Update or Create pending payment record
    await Payment.findOneAndUpdate(
        { user: userId, course: courseId, status: 'pending' },
        { 
            amount: amount / 100,
            paymentMethod: 'razorpay',
            razorpayOrderId: order.id,
            createdAt: new Date()
        },
        { upsert: true, new: true }
    );

    return responseHelper.success(res, { order }, 'Fiscal handshake initiated');
});

// Verify Payment
export const verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.user._id;

    const keySecretSetting = await Setting.findOne({ key: 'razorpay_key_secret' });
    if (!keySecretSetting || !keySecretSetting.value) {
        return next(new AppError('Institutional security layer mismatch. Contact support.', 500));
    }

    const hmac = crypto.createHmac('sha256', keySecretSetting.value);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    // Strategic Cryptographic Guard: Mitigate timing attacks during signature verification
    const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generated_signature),
        Buffer.from(razorpay_signature)
    );

    if (isSignatureValid) {
        // Idempotency: Check if already verified
        const existingCompleted = await Payment.findOne({ razorpayOrderId: razorpay_order_id, status: 'completed' });
        if (existingCompleted) {
            return responseHelper.success(res, {}, 'Institutional access already synchronized');
        }

        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { status: 'completed', razorpayPaymentId: razorpay_payment_id },
            { new: true }
        ).populate('course');

        // Enroll Student via Unified Service
        await performEnrollment({
            userId,
            courseId,
            amount: payment.amount,
            paymentMethod: 'razorpay',
            paymentId: payment._id
        });

        // Update Coupon Usage
        if (req.body.couponCode) {
            await Coupon.findOneAndUpdate(
                { code: req.body.couponCode.toUpperCase() },
                {
                    $inc: { usedCount: 1 },
                    $push: { usedBy: { user: userId, usedAt: new Date() } }
                }
            );
        }

        // Grant points
        await grantPoints(userId, 'course_purchase');

        await createAdminNotification({
            type: 'PAYMENT_SUCCESS',
            message: `New enrollment success for ${req.user.name} in ${payment.course?.courseTitle || 'Course'}`,
            module: 'ecommerce',
            referenceId: payment._id
        });

        // Notify Student
        await createStudentNotification({
            userId,
            type: 'ENROLLMENT_CONFIRMED',
            message: `Welcome to the academy! Your enrollment in "${payment.course?.courseTitle || 'your new course'}" is now active. ✨`,
            module: 'ecommerce',
            referenceId: payment.course?._id
        });

        return responseHelper.success(res, {}, 'Institutional access authorized');
    } else {
        await createAdminNotification({
            type: 'PAYMENT_FAILURE',
            message: `Payment signature verification failed for ${req.user.name}. Integrity alert.`,
            module: 'ecommerce'
        });
        return next(new AppError('Fiscal signature verification failed', 400));
    }
});

// Request COD (Pending Approval)
export const requestCOD = asyncHandler(async (req, res, next) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Curriculum component not found', 404));

    const amount = course.coursePrice - (course.coursePrice * course.discount / 100);

    const payment = await Payment.create({
        user: userId,
        course: courseId,
        amount,
        paymentMethod: 'cod',
        status: 'pending_approval'
    });

    // Trigger Admin Notification
    await createAdminNotification({
        type: 'COD_ORDER',
        message: `New COD Order Request from ${req.user.name} for ₹${amount}`,
        module: 'ecommerce',
        referenceId: payment._id
    });

    return responseHelper.success(res, {}, 'COD request submitted. Awaiting Institutional Approval.');
});

// Approve COD (Admin only)
export const approveCOD = asyncHandler(async (req, res, next) => {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId).populate('course');
    
    if (!payment || payment.status !== 'pending_approval') {
        return next(new AppError('Invalid or duplicate approval protocol', 400));
    }

    payment.status = 'completed';
    payment.approvedBy = req.user._id;
    payment.approvedAt = new Date();
    await payment.save();

    // Enroll Student
    const { user: userId, course: courseId } = payment;
    await performEnrollment({
        userId,
        courseId,
        amount: payment.amount,
        paymentMethod: 'cod',
        paymentId: payment._id
    });

    // Update Coupon Usage
    if (req.body.couponCode) {
        await Coupon.findOneAndUpdate(
            { code: req.body.couponCode.toUpperCase() },
            {
                $inc: { usedCount: 1 },
                $push: { usedBy: { user: userId, usedAt: new Date() } }
            }
        );
    }

    // Grant points
    await grantPoints(userId, 'course_purchase');

    // Notify Student
    await createStudentNotification({
        userId,
        type: 'ENROLLMENT_CONFIRMED',
        message: `Strategic Update: Your COD order for "${payment.course?.courseTitle}" has been APPROVED. Access granted! 🔓`,
        module: 'ecommerce',
        referenceId: payment.course?._id
    });

    return responseHelper.success(res, {}, 'COD Payment Approved & Student Enrolled');
});

// Reject COD (Admin only)
export const rejectCOD = asyncHandler(async (req, res, next) => {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    
    if (!payment || payment.status !== 'pending_approval') {
        return next(new AppError('Invalid or duplicate rejection protocol', 400));
    }

    payment.status = 'rejected';
    payment.approvedBy = req.user._id;
    payment.approvedAt = new Date();
    await payment.save();

    return responseHelper.success(res, {}, 'COD Payment Rejected');
});

// Get Pending COD Orders (Admin only)
export const getPendingCodOrders = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find({ status: 'pending_approval', paymentMethod: 'cod' })
        .populate('user', 'name email')
        .populate('course', 'courseTitle')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { payments });
});

// Get My Pending COD Orders (Student)
export const getMyPendingCodOrders = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find({ 
        user: req.user._id, 
        status: 'pending_approval', 
        paymentMethod: 'cod' 
    })
    .populate('course', 'courseTitle courseThumbnail')
    .sort({ createdAt: -1 });
    
    return responseHelper.success(res, { payments });
});

// --- Notifications ---

// Get Admin Notifications
export const getNotifications = asyncHandler(async (req, res, next) => {
    const { limit = 20, skip = 0 } = req.query;
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
    
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    return responseHelper.success(res, { notifications, unreadCount });
});

// Mark Notification as Read
export const markAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (id === 'all') {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    } else {
        await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    return responseHelper.success(res, {}, 'Institutional signal acknowledged');
});

// (Original buyWithWallet remains below, adapted for potential notifications)
export const buyWithWallet = asyncHandler(async (req, res, next) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Target curriculum not found', 404));

    const amount = course.coursePrice - (course.coursePrice * course.discount / 100);
    const user = await User.findById(userId);

    if (user.walletBalance < amount) {
        return next(new AppError('Insufficient fiscal reserves in wallet', 400));
    }

    user.walletBalance -= amount;
    await user.save();

    const payment = await Payment.create({
        user: userId,
        course: courseId,
        amount,
        paymentMethod: 'wallet',
        status: 'completed'
    });

    await WalletTransaction.create({
        userId,
        amount,
        type: 'debit',
        source: 'course_purchase',
        description: `Purchased course: ${course.courseTitle}`,
        metadata: { courseId, paymentId: payment._id }
    });

    await performEnrollment({
        userId,
        courseId,
        amount,
        paymentMethod: 'wallet',
        paymentId: payment._id
    });

    await grantPoints(userId, 'course_purchase');

    // Notify Admin
    await createAdminNotification({
        type: 'PAYMENT_SUCCESS',
        message: `${req.user.name} bought ${course.courseTitle} using Wallet`,
        module: 'ecommerce',
        referenceId: payment._id
    });

    // Notify Student
    await createStudentNotification({
        userId,
        type: 'ENROLLMENT_CONFIRMED',
        message: `Vault Transaction: You have successfully enrolled in "${course.courseTitle}" using your wallet balance. 💎`,
        module: 'ecommerce',
        referenceId: course._id
    });

    return responseHelper.success(res, {}, 'Institutional access granted via vault reserves');
});
