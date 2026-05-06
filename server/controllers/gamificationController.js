import User from "../models/User.js";
import Badge from "../models/Badge.js";
import GamificationSetting from "../models/GamificationSetting.js";
import PointHistory from "../models/PointHistory.js";
import WalletTransaction from "../models/WalletTransaction.js";
import { seedGamificationSettings } from "../services/gamificationService.js";
import { createAdminNotification } from "../services/notificationService.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Admin: Get all gamification settings
export const getSettings = asyncHandler(async (req, res, next) => {
    let settings = await GamificationSetting.find();
    if (settings.length === 0) {
        await seedGamificationSettings();
        settings = await GamificationSetting.find();
    }
    return responseHelper.success(res, { settings }, 'Gamification protocols synchronized');
});

// Admin: Update point settings
export const updateSettings = asyncHandler(async (req, res, next) => {
    const { settings } = req.body; // Array of { _id, points, isActive }
    for (const s of settings) {
        await GamificationSetting.findByIdAndUpdate(s._id, { 
            points: s.points, 
            isActive: s.isActive 
        });
    }
    return responseHelper.success(res, {}, 'Gamification rules synchronized');
});

// Admin/Student: Get all badges
export const getBadges = asyncHandler(async (req, res, next) => {
    const badges = await Badge.find();
    return responseHelper.success(res, { badges }, 'Reward typography registry synchronized');
});

// Admin: Create Badge
export const createBadge = asyncHandler(async (req, res, next) => {
    const badge = await Badge.create(req.body);
    return responseHelper.success(res, { badge }, 'Institutional badge provisioned', 201);
});

// Admin: Delete Badge
export const deleteBadge = asyncHandler(async (req, res, next) => {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return next(new AppError('Institutional badge not found', 404));
    return responseHelper.success(res, {}, 'Institutional badge decommissioned');
});

// Student: Get personal stats
export const getUserStats = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
        .select('gamification')
        .populate('gamification.badges');
    
    if (!user) return next(new AppError('Identity not found in repository', 404));

    if (!user.gamification) {
        user.gamification = { totalPoints: 0, currentPoints: 0, level: 1, badges: [] };
    }

    return responseHelper.success(res, { stats: user.gamification }, 'Institutional performance synchronized');
});

// Student: Get point history
export const getPointHistory = asyncHandler(async (req, res, next) => {
    const { limit = 20, skip = 0 } = req.query;
    const history = await PointHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
        
    return responseHelper.success(res, { history }, 'Point accrual history synchronized');
});

// Admin: Get all point history (for audit)
export const getAllPointHistory = asyncHandler(async (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    const history = await PointHistory.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
        
    return responseHelper.success(res, { history }, 'Global point accrual ledger synchronized');
});

// Student: Convert points to wallet balance
export const convertToWallet = asyncHandler(async (req, res, next) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const RATE = 500; 

        const user = await User.findById(userId).select('gamification').session(session);
        if (!user || !user.gamification) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError('Institutional intelligence record not found', 404));
        }

        const currentPoints = user.gamification.currentPoints || 0;
        
        // Institutional Guard: Prevent negative point manipulation
        if (currentPoints < RATE) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError(`Minimum mastery threshold (${RATE} points) required for conversion`, 400));
        }

        const pointsToConvert = Math.floor(currentPoints / RATE) * RATE;
        const cashAmount = pointsToConvert / RATE;

        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: userId, 
                "gamification.currentPoints": { $gte: pointsToConvert } 
            },
            { 
                $inc: { 
                    "gamification.currentPoints": -pointsToConvert,
                    "walletBalance": cashAmount 
                } 
            },
            { new: true, session }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError('Strategic synchronization conflict or insufficient point ledger', 409));
        }

        await PointHistory.create([{
            userId,
            points: -pointsToConvert,
            event: 'redemption',
            description: `Converted ${pointsToConvert} points to ₹${cashAmount} wallet balance`,
            balanceAfter: updatedUser.gamification.currentPoints
        }], { session });

        await WalletTransaction.create([{
            userId,
            amount: cashAmount,
            type: 'credit',
            status: 'success',
            source: 'gamification_conversion',
            description: `Points conversion reward (${pointsToConvert} pts)`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Notify Admin of Reward Redemption
        await createAdminNotification({
            type: 'REWARD_REDEMPTION',
            message: `${req.user.name} redeemed points for ₹${cashAmount} wallet balance`,
            module: 'gamification'
        });

        return responseHelper.success(res, {
            newBalance: updatedUser.walletBalance,
            remainedPoints: updatedUser.gamification.currentPoints
        }, `Redeemed ${pointsToConvert} points for ₹${cashAmount}`);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

// Student: Get Global Leaderboard (Top 50)
export const getLeaderboard = asyncHandler(async (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    
    const topScholars = await User.aggregate([
        { $match: { role: 'student' } },
        { $sort: { 'gamification.totalPoints': -1 } },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: 'badges',
                localField: 'gamification.badges',
                foreignField: '_id',
                as: 'badges_data'
            }
        },
        {
            $project: {
                name: 1,
                avatar: 1,
                gamification: {
                    totalPoints: 1,
                    badges: "$badges_data"
                }
            }
        }
    ]);
    
    return responseHelper.success(res, { leaderboard: topScholars }, 'Global scholarly leaderboard synchronized');
});

// Admin: Get Global Gamification Statistics
export const getAdminStats = asyncHandler(async (req, res, next) => {
    const totalPointsIssuedRes = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$gamification.totalPoints' } } }
    ]);

    const activeBadgeCount = await Badge.countDocuments({ isActive: true });
    
    const recentActivity = await PointHistory.find()
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

    const badgeClaimsRes = await User.aggregate([
        { $project: { badgeCount: { $size: { $ifNull: ['$gamification.badges', []] } } } },
        { $group: { _id: null, total: { $sum: '$badgeCount' } } }
    ]);

    return responseHelper.success(res, { 
        stats: {
            totalPointsIssued: totalPointsIssuedRes[0]?.total || 0,
            activeBadgeCount,
            badgeClaims: badgeClaimsRes[0]?.total || 0,
            recentActivity
        }
    }, 'Institutional gamification metrics synchronized');
});
