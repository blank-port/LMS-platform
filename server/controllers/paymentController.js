import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Notification from "../models/Notification.js";
import { performEnrollment } from "../services/enrollmentService.js";
import { grantPoints } from "../services/gamificationService.js";
import { createAdminNotification, createStudentNotification } from "../services/notificationService.js";

// Get Pending Payments (Centralized Fiscal Oversight)
export const getPendingPayments = async (req, res) => {
    try {
        const { method = 'all' } = req.query;
        let query = { status: { $in: ['pending', 'pending_approval'] } };

        if (method !== 'all') {
            query.paymentMethod = method;
        }

        const payments = await Payment.find(query)
            .populate('user', 'name email avatar')
            .populate('course', 'courseTitle courseThumbnail')
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Helper to get Razorpay Instance
const getRazorpayInstance = async () => {
    const keyId = await Setting.findOne({ key: 'razorpay_key_id' });
    const keySecret = await Setting.findOne({ key: 'razorpay_key_secret' });

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured in Admin Settings');
    }

    return new Razorpay({
        key_id: keyId.value,
        key_secret: keySecret.value,
    });
};

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
export const createOrder = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const amount = (course.coursePrice - (course.coursePrice * course.discount / 100)) * 100; // in paisa

        const razorpay = await getRazorpayInstance();
        const options = {
            amount: Math.round(amount),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Create a pending payment record
        await Payment.create({
            user: userId,
            course: courseId,
            amount: amount / 100,
            paymentMethod: 'razorpay',
            status: 'pending',
            razorpayOrderId: order.id
        });

        res.json({ success: true, order });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
        const userId = req.user._id;

        const keySecretSetting = await Setting.findOne({ key: 'razorpay_key_secret' });
        const hmac = crypto.createHmac('sha256', keySecretSetting.value);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Update Payment Record
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { status: 'completed', razorpayPaymentId: razorpay_payment_id },
                { new: true }
            );

            // Enroll Student via Unified Service
            await performEnrollment({
                userId,
                courseId,
                amount: payment.amount,
                paymentMethod: 'razorpay',
                paymentId: payment._id
            });

            // Grant points for education investment
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

            res.json({ success: true, message: "Payment Verified & Enrolled" });
        } else {
            // Log Payment Failure Notification
            await createAdminNotification({
                type: 'PAYMENT_FAILURE',
                message: `Payment signature verification failed for ${req.user.name}`,
                module: 'ecommerce'
            });
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Request COD (Pending Approval)
export const requestCOD = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
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

        res.json({ success: true, message: "COD request submitted. Awaiting Admin Approval." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Approve COD (Admin only)
export const approveCOD = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await Payment.findById(paymentId).populate('course');
        
        if (!payment || payment.status !== 'pending_approval') {
            return res.status(400).json({ success: false, message: "Invalid approval request" });
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

        res.json({ success: true, message: "COD Payment Approved & Student Enrolled" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Reject COD (Admin only)
export const rejectCOD = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await Payment.findById(paymentId);
        
        if (!payment || payment.status !== 'pending_approval') {
            return res.status(400).json({ success: false, message: "Invalid rejection request" });
        }

        payment.status = 'rejected';
        payment.approvedBy = req.user._id;
        payment.approvedAt = new Date();
        await payment.save();

        res.json({ success: true, message: "COD Payment Rejected" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Pending COD Orders (Admin only)
export const getPendingCodOrders = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending_approval', paymentMethod: 'cod' })
            .populate('user', 'name email')
            .populate('course', 'courseTitle')
            .sort({ createdAt: -1 });
        res.json({ success: true, payments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get My Pending COD Orders (Student)
export const getMyPendingCodOrders = async (req, res) => {
    try {
        const payments = await Payment.find({ 
            user: req.user._id, 
            status: 'pending_approval', 
            paymentMethod: 'cod' 
        })
        .populate('course', 'courseTitle courseThumbnail')
        .sort({ createdAt: -1 });
        
        res.json({ success: true, payments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- Notifications ---

// Get Admin Notifications
export const getNotifications = async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query;
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));
        
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Notification as Read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'all') {
            await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        } else {
            await Notification.findByIdAndUpdate(id, { isRead: true });
        }
        res.json({ success: true, message: 'Institutional signal acknowledged' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// (Original buyWithWallet remains below, adapted for potential notifications)
export const buyWithWallet = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const amount = course.coursePrice - (course.coursePrice * course.discount / 100);
        const user = await User.findById(userId);

        if (user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
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

        res.json({ success: true, message: "Course purchased successfully via wallet" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
