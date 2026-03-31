import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
import WalletTransaction from "../models/WalletTransaction.js";
import { performEnrollment } from "../services/enrollmentService.js";

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

    // Log Admin Commission (Using the payment ID as a reference, or a system account if one exists)
    // For now, we log it against the admin user who processed it or just as a general entry
    // Usually, there's a specific system user ID for platform earnings
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

// Create Order
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

            res.json({ success: true, message: "Payment Verified & Enrolled" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Request COD
export const requestCOD = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        const amount = course.coursePrice - (course.coursePrice * course.discount / 100);

        await Payment.create({
            user: userId,
            course: courseId,
            amount,
            paymentMethod: 'cod',
            status: 'cod_pending'
        });

        res.json({ success: true, message: "COD request submitted. Awaiting approval." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Approve COD (Admin/Instructor)
export const approveCOD = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await Payment.findById(paymentId);
        if (!payment || payment.status !== 'cod_pending') {
            return res.status(400).json({ success: false, message: "Invalid payment request" });
        }

        payment.status = 'completed';
        await payment.save();

        // Enroll Student via Unified Service
        const { user: userId, course: courseId } = payment;
        await performEnrollment({
            userId,
            courseId,
            amount: payment.amount,
            paymentMethod: 'cod',
            paymentId: payment._id
        });

        res.json({ success: true, message: "COD Payment Approved & Student Enrolled" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Pending Payments (Admin/Instructor)
export const getPendingPayments = async (req, res) => {
    try {
        const { method } = req.query;
        let query = { status: 'cod_pending' };
        
        if (method && method !== 'all') {
            query.paymentMethod = method;
        }

        const payments = await Payment.find(query)
            .populate('user', 'name email')
            .populate('course', 'courseTitle')
            .sort({ createdAt: -1 });
        res.json({ success: true, payments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Buy with Wallet
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

        // Debit Student Wallet
        user.walletBalance -= amount;
        await user.save();

        // Create Payment Record
        const payment = await Payment.create({
            user: userId,
            course: courseId,
            amount,
            paymentMethod: 'wallet',
            status: 'completed'
        });
        console.log('DEBUG: Payment Created Successfully:', payment._id, 'Status:', payment.status);

        // Log Student Transaction
        await WalletTransaction.create({
            userId,
            amount,
            type: 'debit',
            source: 'course_purchase',
            description: `Purchased course: ${course.courseTitle}`,
            metadata: { courseId, paymentId: payment._id }
        });

        // Enroll Student via Unified Service
        await performEnrollment({
            userId,
            courseId,
            amount,
            paymentMethod: 'wallet',
            paymentId: payment._id
        });

        res.json({ success: true, message: "Course purchased successfully via wallet" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
