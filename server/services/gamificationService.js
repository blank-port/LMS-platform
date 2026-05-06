import User from "../models/User.js";
import Badge from "../models/Badge.js";
import GamificationSetting from "../models/GamificationSetting.js";
import PointHistory from "../models/PointHistory.js";

/**
 * Grant points to a user based on an event.
 * Also checks for level up and badge unlocks.
 */
export const grantPoints = async (userId, event, context = {}) => {
    try {
        const setting = await GamificationSetting.findOne({ event, isActive: true });
        if (!setting || setting.points === 0) return null;

        // 1. One-time reward check for specific events
        const oneTimeEvents = ['registration', 'profile_update', 'referral_success'];
        if (oneTimeEvents.includes(event)) {
            const existing = await PointHistory.findOne({ userId, event });
            if (existing) return null; // Already rewarded
        }

        // 2. Reference-based check for itemized rewards (unit, course, etc.)
        if (context.referenceId) {
            const existing = await PointHistory.findOne({ 
                userId, 
                event, 
                referenceId: context.referenceId 
            });
            if (existing) return null; // Already rewarded for this specific item
        }

        // 3. Daily cap check for recurring events (e.g., login)
        if (event === 'login') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const todayLogin = await PointHistory.findOne({
                userId,
                event: 'login',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            if (todayLogin) return null; // Already rewarded today
        }

        const user = await User.findById(userId);
        if (!user) return null;

        // Initialize gamification object if missing (defensive)
        if (!user.gamification) {
            user.gamification = { totalPoints: 0, currentPoints: 0, level: 1, badges: [], streakCount: 0 };
        }

        // Auto-update streak if this is a points-earning activity
        await updateUserStreak(user);

        const pointsToGrant = setting.points;

        // Audit Trail (Created FIRST to enforce atomicity and prevent race-condition notification spam)
        try {
            await PointHistory.create({
                userId,
                points: pointsToGrant,
                event,
                referenceId: context.referenceId,
                description: setting.description || `Points for ${event.replace('_', ' ')}`,
                balanceAfter: user.gamification.currentPoints + pointsToGrant
            });
        } catch (error) {
            if (error.code === 11000) return null; // Duplicate key error - already rewarded concurrently
            throw error;
        }

        user.gamification.totalPoints += pointsToGrant;
        user.gamification.currentPoints += pointsToGrant;

        // Notify of points (for meaningful amounts)
        const { createStudentNotification } = await import("./notificationService.js");
        if (pointsToGrant >= 5) {
            await createStudentNotification({
                userId,
                type: 'ACHIEVEMENT_UNLOCKED',
                message: `Scholarly Progress: You earned ${pointsToGrant} points for ${event.replace('_', ' ')}! 📈`,
                module: 'gamification'
            });
        }

        // Level Up Logic
        const newLevel = Math.floor(user.gamification.totalPoints / 3000) + 1;
        if (newLevel > user.gamification.level) {
            user.gamification.level = newLevel;
            await createStudentNotification({
                userId,
                type: 'ACHIEVEMENT_UNLOCKED',
                message: `Strategic Promotion: You have ascended to Level ${newLevel}! 🛡️`,
                module: 'gamification'
            });
        }

        await user.save();

        // Trigger Badge Check
        await checkAndAwardBadges(user, event);

        return { points: pointsToGrant, total: user.gamification.totalPoints };
    } catch (error) {
        console.error('Gamification Service Error:', error);
        return null;
    }
};

/**
 * Check and award badges based on user stats and the latest event.
 */
export const checkAndAwardBadges = async (user, event) => {
    try {
        // Map event to badge type categories
        const typeMap = {
            'login': 'activity',
            'registration': 'registration',
            'course_complete': 'course_count',
            'unit_complete': 'learning',
            'quiz_pass': 'test',
            'assignment_complete': 'assignment',
            'blog_create': 'contribution',
            'course_review': 'feedback',
            'course_purchase': 'commerce',
            'referral_success': 'referral',
            'profile_update': 'profile'
        };

        const badgeType = typeMap[event];
        if (!badgeType) return;

        // Find relevant active badges the user doesn't have yet
        const potentialBadges = await Badge.find({
            type: badgeType,
            isActive: true,
            _id: { $nin: user.gamification.badges }
        });

        // Calculate current threshold value for the user
        let currentValue = 0;
        switch (badgeType) {
            case 'activity':
                // Total Logins (could count login history or use totalPoints as proxy)
                // For now, let's use PointHistory as indicator of logins
                currentValue = await PointHistory.countDocuments({ userId: user._id, event: 'login' });
                break;
            case 'registration':
                const diffTime = Math.abs(new Date() - user.createdAt);
                currentValue = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
                break;
            case 'learning':
                currentValue = user.gamification.totalPoints;
                break;
            case 'course_count':
                const Enrollment = (await import('../models/Enrollment.js')).default;
                currentValue = await Enrollment.countDocuments({ userId: user._id, completed: true });
                break;
            case 'test':
                const QuizAttempt = (await import('../models/QuizAttempt.js')).default;
                currentValue = await QuizAttempt.countDocuments({ userId: user._id, score: { $gte: 60 } }); // Pass threshold
                break;
            case 'contribution':
                const Blog = (await import('../models/Blog.js')).default;
                currentValue = await Blog.countDocuments({ author: user._id });
                break;
            case 'feedback':
                const Review = (await import('../models/Review.js')).default;
                currentValue = await Review.countDocuments({ userId: user._id });
                break;
            case 'commerce':
                const CourseEnrollment = (await import('../models/Enrollment.js')).default;
                currentValue = await CourseEnrollment.countDocuments({ userId: user._id });
                break;
            case 'referral':
                currentValue = await User.countDocuments({ referredBy: user._id });
                break;
            case 'profile':
                // Binary check: basic info + avatar + about
                currentValue = (user.name && user.avatar && user.about) ? 1 : 0;
                break;
            // Add more as needed
        }

        const newBadges = potentialBadges.filter(b => currentValue >= b.threshold);
        if (newBadges.length > 0) {
            user.gamification.badges.push(...newBadges.map(b => b._id));
            await user.save();
        }
    } catch (error) {
        console.error('Badge Service Error:', error);
    }
};

/**
 * Updates user streak based on activity frequency.
 */
export const updateUserStreak = async (user) => {
    try {
        const now = new Date();
        const lastUpdate = user.gamification.lastStreakUpdate ? new Date(user.gamification.lastStreakUpdate) : null;
        
        const isSameDay = lastUpdate && now.toDateString() === lastUpdate.toDateString();
        
        if (isSameDay) return; // Already updated today

        if (!lastUpdate) {
            user.gamification.streakCount = 1;
            user.gamification.lastStreakUpdate = now;
            return;
        }

        // Check if it's exactly the next day for consecutive streak
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isNextDay = yesterday.toDateString() === lastUpdate.toDateString();

        if (isNextDay) {
            user.gamification.streakCount += 1;
        } else {
            // Streak broken (more than 1 day gap)
            user.gamification.streakCount = 1;
        }
        
        user.gamification.lastStreakUpdate = now;
    } catch (e) {
        console.error('Streak Update Error:', e);
    }
};

/**
 * Initialize default point settings if they don't exist.
 */
export const seedGamificationSettings = async () => {
    const defaults = [
        { event: 'registration', points: 50, description: 'New account reward' },
        { event: 'login', points: 1, description: 'Daily login incentive' },
        { event: 'unit_complete', points: 5, description: 'Content mastery milestone' },
        { event: 'course_complete', points: 25, description: 'Institutional success' },
        { event: 'quiz_pass', points: 10, description: 'Strategic competence verified' },
        { event: 'discussion_create', points: 2, description: 'Intellectual leadership' },
        { event: 'blog_create', points: 20, description: 'Knowledge dissemination' },
        { event: 'course_review', points: 5, description: 'Course quality verification' },
        { event: 'course_purchase', points: 50, description: 'Educational investment' },
        { event: 'referral_success', points: 100, description: 'Platform expansion contribution' },
        { event: 'profile_update', points: 5, description: 'Digital identity synchronization' }
    ];

    for (const d of defaults) {
        await GamificationSetting.findOneAndUpdate({ event: d.event }, d, { upsert: true, new: true });
    }

    // Initialize default badges
    const badgeDefaults = [
        { title: 'Intelligence Recruit', description: 'Joined the PrismEd network', type: 'registration', threshold: 1, icon: 'https://cdn-icons-png.flaticon.com/512/10433/10433048.png', isActive: true },
        { title: 'Scholastic Novice', description: 'Earned first 1000 points', type: 'learning', threshold: 1000, icon: 'https://cdn-icons-png.flaticon.com/512/476/476863.png', isActive: true },
        { title: 'Grand Scholar', description: 'Surpassed 5000 point threshold', type: 'learning', threshold: 5000, icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png', isActive: true },
        { title: 'Active Processor', description: 'Logged in 10 times', type: 'activity', threshold: 10, icon: 'https://cdn-icons-png.flaticon.com/512/3281/3281306.png', isActive: true },
        { title: 'Knowledge Transmitter', description: 'Published 3 scholarly blogs', type: 'contribution', threshold: 3, icon: 'https://cdn-icons-png.flaticon.com/512/2592/2592317.png', isActive: true },
        { title: 'Architect of Growth', description: 'Referred 5 new scholars', type: 'referral', threshold: 5, icon: 'https://cdn-icons-png.flaticon.com/512/913/913341.png', isActive: true }
    ];

    for (const b of badgeDefaults) {
        await Badge.findOneAndUpdate({ title: b.title }, b, { upsert: true, new: true });
    }

    // Ensure existing users have referral codes
    const usersWithoutCode = await User.find({ referralCode: { $exists: false } });
    for (const user of usersWithoutCode) {
        user.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await user.save();
    }

    console.log('Gamification settings seeded successfully');
};
