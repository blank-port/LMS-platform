import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Setting from "../models/Setting.js";
import crypto from 'crypto';
import { getRazorpayInstance } from "../utils/razorpay.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create Razorpay Order for Wallet Deposit
export const createDepositOrder = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0 || amount > 50000) {
        return next(new AppError('Strategic fiscal constraint violation: Invalid deposit amount (Max 50k)', 400));
    }

    // TEMPORARY: require admin approval for deposits over ₹1000 without full gateway validation logic
    if (amount > 1000) {
        return next(new AppError('Large deposits require payment gateway verification. Contact admin.', 403));
    }

    const razorpay = await getRazorpayInstance();
    const options = {
        amount: Math.round(amount * 100), // in paisa
        currency: "INR",
        receipt: `deposit_${userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return responseHelper.success(res, { order }, 'Deposit order provisioned');
});

// Verify Wallet Deposit Payment
export const verifyDeposit = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const userId = req.user._id;

    const keySecretSetting = await Setting.findOne({ key: 'razorpay_key_secret' });
    const hmac = crypto.createHmac('sha256', keySecretSetting.value);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    
    // Strategic Cryptographic Guard: Mitigate timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generated_signature),
        Buffer.from(razorpay_signature)
    );

    if (!isSignatureValid) {
        return next(new AppError('Fiscal signature verification failed', 400));
    }

    // Idempotency check: Ensure transaction doesn't exist
    const existingTx = await WalletTransaction.findOne({ 'metadata.razorpayPaymentId': razorpay_payment_id });
    if (existingTx) {
        return responseHelper.success(res, {}, 'Deposit already synchronized');
    }

    const user = await User.findById(userId);
    user.walletBalance += Number(amount);
    await user.save();

    await WalletTransaction.create({
        userId,
        amount,
        type: 'credit',
        status: 'success',
        source: 'wallet_deposit',
        description: `Aggregated funds via Razorpay`,
        metadata: { 
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        }
    });

    return responseHelper.success(res, { balance: user.walletBalance }, 'Fiscal reserves synchronized');
});

// Legacy Simulated Deposit (Hardened with guard)
export const depositToWallet = asyncHandler(async (req, res, next) => {
    const { amount, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0 || amount > 50000) {
        return next(new AppError('Strategic fiscal constraint violation: Invalid deposit amount (Max 50k)', 400));
    }

    // TEMPORARY: require admin approval for deposits over ₹1000
    if (amount > 1000) {
        return next(new AppError('Large deposits require payment gateway verification. Contact admin.', 403));
    }

    const user = await User.findById(userId);
    if (!user) return next(new AppError('Institutional identity node invalid', 404));

    user.walletBalance += Number(amount);
    await user.save();

    await WalletTransaction.create({
        userId,
        amount,
        type: 'credit',
        status: 'success',
        source: 'wallet_deposit',
        description: `Aggregated funds via ${paymentMethod || 'standard protocol'} (Manual/Simulated)`,
        metadata: { description: 'Verified institutional deposit' }
    });

    return responseHelper.success(res, { balance: user.walletBalance }, 'Fiscal assets synchronized successfully');
});

// Get wallet details
export const getWalletDetails = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select('walletBalance');
    if (!user) return next(new AppError('Institutional identity node invalid', 404));

    const transactions = await WalletTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await WalletTransaction.countDocuments({ userId });
    const meta = {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { balance: user.walletBalance, transactions }, 'Fiscal liquidity registry synchronized', 200, meta);
});

// Request withdrawal (Instructors)
export const requestWithdrawal = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return next(new AppError('Institutional identity node invalid', 404));

    if (user.walletBalance < Number(amount)) {
        return next(new AppError('Strategic fiscal shortfall: Insufficient secondary liquidity', 400));
    }

    user.walletBalance -= Number(amount);
    await user.save();

    await WalletTransaction.create({
        userId,
        amount,
        type: 'debit',
        source: 'withdrawal',
        status: 'pending',
        description: 'Institutional withdrawal request initiated'
    });

    return responseHelper.success(res, { balance: user.walletBalance }, 'Withdrawal protocol initiated');
});

// Admin: Get all withdrawal requests
export const getPendingWithdrawals = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const withdrawals = await WalletTransaction.find({ 
        source: 'withdrawal', 
        status: 'pending' 
    })
    .populate('userId', 'name email payoutSettings')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await WalletTransaction.countDocuments({ source: 'withdrawal', status: 'pending' });
    const meta = {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { withdrawals }, 'Pending withdrawal registry synchronized', 200, meta);
});

// Admin: Approve/Reject withdrawal
export const processWithdrawal = asyncHandler(async (req, res, next) => {
    const { transactionId, status } = req.body; // status: 'success' or 'failed' (rejected)
    
    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction || transaction.status !== 'pending') {
        return next(new AppError('Strategic transaction node invalid or already processed', 400));
    }

    if (status === 'failed') {
        const user = await User.findById(transaction.userId);
        if (user) {
            user.walletBalance += transaction.amount;
            await user.save();
        }
    }

    transaction.status = status;
    await transaction.save();

    return responseHelper.success(res, {}, `Fiscal withdrawal protocol finalized: ${status}`);
});
