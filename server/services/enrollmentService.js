import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Setting from "../models/Setting.js";
import mongoose from "mongoose";

/**
 * Unified Enrollment Service
 * Handles enrollment creation, student/course/instructor updates, and commission splits.
 */
export const performEnrollment = async ({ userId, courseId, amount, paymentMethod, paymentId }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Check existing enrollment
        const existing = await Enrollment.findOne({ userId, courseId }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return { success: false, message: 'Already enrolled' };
        }

        // 2. Create Enrollment
        const enrollmentArray = await Enrollment.create([{ userId, courseId }], { session });
        const enrollment = enrollmentArray[0];

        // 3. Link to Course & User
        await Course.findByIdAndUpdate(courseId, { $push: { enrolledStudents: userId } }, { session });
        await User.findByIdAndUpdate(userId, { $push: { enrolledCourses: courseId } }, { session });

        // 4. Process Commission Split (If amount > 0)
        if (amount > 0) {
            const course = await Course.findById(courseId).session(session);
            const globalCommSetting = await Setting.findOne({ key: 'global_commission_percentage' }).session(session);
            const commissionPercent = course.commissionRate > 0 ? course.commissionRate : (globalCommSetting ? globalCommSetting.value : 20);

            const adminShare = (amount * commissionPercent) / 100;
            const instructorShare = amount - adminShare;

            // Credit Instructor Wallet
            const instructor = await User.findById(course.instructor).session(session);
            instructor.walletBalance += instructorShare;
            await instructor.save({ session });

            await WalletTransaction.create([{
                userId: course.instructor,
                amount: instructorShare,
                type: 'credit',
                source: 'instructor_earnings',
                description: `Earnings for: ${course.courseTitle}`,
                metadata: { courseId, paymentId }
            }], { session });

            // Credit Admin Wallet
            const adminUser = await User.findOne({ role: 'admin' }).session(session);
            if (adminUser) {
                adminUser.walletBalance += adminShare;
                await adminUser.save({ session });
                await WalletTransaction.create([{
                    userId: adminUser._id,
                    amount: adminShare,
                    type: 'credit',
                    source: 'admin_commission',
                    description: `Commission for: ${course.courseTitle}`,
                    metadata: { courseId, paymentId }
                }], { session });
            }
        }

        // 5. Process Referral Rewards
        const user = await User.findById(userId).session(session);
        if (user && user.referredBy) {
            const rewardAmount = 50; // Standard Referral Reward Protocol (Base Currency)
            
            const referrer = await User.findById(user.referredBy).session(session);
            if (referrer) {
                referrer.walletBalance += rewardAmount;
                await referrer.save({ session });

                await WalletTransaction.create([{
                    userId: referrer._id,
                    amount: rewardAmount,
                    type: 'credit',
                    source: 'referral_bonus',
                    description: `Referral incentive for: ${user.name}`,
                    metadata: { referredUserId: userId, courseId }
                }], { session });

                // Dispatch Scholar Alert
                const { createStudentNotification } = await import('./notificationService.js');
                await createStudentNotification({
                    userId: referrer._id,
                    type: 'SYSTEM_ALERT',
                    message: `You received a ₹${rewardAmount} referral bonus for ${user.name}'s enrollment!`,
                    module: 'wallet',
                    referenceId: user._id
                });
            }
        }

        await session.commitTransaction();
        session.endSession();
        return { success: true, enrollment };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
