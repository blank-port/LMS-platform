import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Setting from "../models/Setting.js";

// Deposit money to student wallet (Simulated Gateway Verification)
export const depositToWallet = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!amount || amount <= 0 || amount > 50000) {
            return res.status(400).json({ success: false, message: "Invalid deposit amount (Max 50k per session)" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Security Context Invalid" });

        // Simulate a verified transaction
        user.walletBalance += Number(amount);
        await user.save();

        await WalletTransaction.create({
            userId,
            amount,
            type: 'credit',
            status: 'success',
            source: 'wallet_deposit',
            description: `Aggregated funds via ${paymentMethod || 'standard protocol'}`,
            metadata: { description: 'Verified institutional deposit' }
        });

        res.json({ success: true, balance: user.walletBalance, message: "Fiscal Assets Synchronized" });
    } catch (error) {
        console.error('Wallet Error:', error);
        res.json({ success: false, message: 'Transaction protocol failure.' });
    }
};

// Get wallet details
export const getWalletDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('walletBalance');
        const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 });

        res.json({ success: true, balance: user.walletBalance, transactions });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Request withdrawal (Instructors)
export const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // Debit the wallet immediately but status is pending in transaction
        user.walletBalance -= Number(amount);
        await user.save();

        await WalletTransaction.create({
            userId,
            amount,
            type: 'debit',
            source: 'withdrawal',
            status: 'pending',
            description: 'Withdrawal request submitted'
        });

        res.json({ success: true, balance: user.walletBalance, message: "Withdrawal request submitted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Get all withdrawal requests
export const getPendingWithdrawals = async (req, res) => {
    try {
        const withdrawals = await WalletTransaction.find({ 
            source: 'withdrawal', 
            status: 'pending' 
        }).populate('userId', 'name email payoutSettings');

        res.json({ success: true, withdrawals });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin: Approve/Reject withdrawal
export const processWithdrawal = async (req, res) => {
    try {
        const { transactionId, status } = req.body; // status: 'success' or 'failed' (rejected)
        
        const transaction = await WalletTransaction.findById(transactionId);
        if (!transaction || transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Invalid transaction" });
        }

        if (status === 'failed') {
            // Refund the user wallet
            const user = await User.findById(transaction.userId);
            user.walletBalance += transaction.amount;
            await user.save();
        }

        transaction.status = status;
        await transaction.save();

        res.json({ success: true, message: `Withdrawal ${status}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
