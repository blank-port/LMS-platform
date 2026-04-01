import User from "../models/User.js";
import Badge from "../models/Badge.js";
import GamificationSetting from "../models/GamificationSetting.js";
import PointHistory from "../models/PointHistory.js";
import WalletTransaction from "../models/WalletTransaction.js";
import { seedGamificationSettings } from "../services/gamificationService.js";

// Admin: Get all gamification settings
export const getSettings = async (req, res) => {
    try {
        let settings = await GamificationSetting.find();
        if (settings.length === 0) {
            await seedGamificationSettings();
            settings = await GamificationSetting.find();
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Update point settings
export const updateSettings = async (req, res) => {
    try {
        const { settings } = req.body; // Array of { _id, points, isActive }
        for (const s of settings) {
            await GamificationSetting.findByIdAndUpdate(s._id, { 
                points: s.points, 
                isActive: s.isActive 
            });
        }
        res.json({ success: true, message: 'Gamification rules synchronized' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin/Student: Get all badges
export const getBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json({ success: true, badges });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Create Badge
export const createBadge = async (req, res) => {
    try {
        const badge = await Badge.create(req.body);
        res.json({ success: true, badge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete Badge
export const deleteBadge = async (req, res) => {
    try {
        await Badge.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Badge decommissioned' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Student: Get personal stats
export const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('gamification')
            .populate('gamification.badges');
        
        if (!user.gamification) {
            user.gamification = { totalPoints: 0, currentPoints: 0, level: 1, badges: [] };
        }

        res.json({ success: true, stats: user.gamification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Student: Get point history
export const getPointHistory = async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query;
        const history = await PointHistory.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));
            
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all point history (for audit)
export const getAllPointHistory = async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;
        const history = await PointHistory.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));
            
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Student: Convert points to wallet balance
export const convertToWallet = async (req, res) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const RATE = 500; 

        const user = await User.findById(userId).select('gamification').session(session);
        if (!user || !user.gamification) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Institutional Intelligence Record Not Found' });
        }

        const currentPoints = user.gamification.currentPoints || 0;
        
        // Institutional Guard: Prevent negative point manipulation
        if (currentPoints < RATE) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: `Minimum ${RATE} points required for conversion. You currently have ${currentPoints} points.` });
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
            return res.status(409).json({ success: false, message: 'Strategic Synchronization Conflict or Insufficient Points' });
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

        res.json({ 
            success: true, 
            message: `Converted ${pointsToConvert} points to ₹${cashAmount}`,
            newBalance: updatedUser.walletBalance,
            remainedPoints: updatedUser.gamification.currentPoints
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: "Transaction Aborted: " + error.message });
    }
};

// Student: Get Global Leaderboard (Top 50)
export const getLeaderboard = async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;
        const topScholars = await User.find({ role: 'student' })
            .select('name avatar gamification')
            .populate('gamification.badges', 'title')
            .sort({ 'gamification.totalPoints': -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));
        
        res.json({ success: true, leaderboard: topScholars });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get Global Gamification Statistics
export const getAdminStats = async (req, res) => {
    try {
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

        res.json({ 
            success: true, 
            stats: {
                totalPointsIssued: totalPointsIssuedRes[0]?.total || 0,
                activeBadgeCount,
                badgeClaims: badgeClaimsRes[0]?.total || 0,
                recentActivity
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
