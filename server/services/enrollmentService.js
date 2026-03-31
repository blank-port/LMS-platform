import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Setting from "../models/Setting.js";

/**
 * Unified Enrollment Service
 * Handles enrollment creation, student/course/instructor updates, and commission splits.
 */
export const performEnrollment = async ({ userId, courseId, amount, paymentMethod, paymentId }) => {
    // 1. Check existing enrollment
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) return { success: false, message: 'Already enrolled' };

    // 2. Create Enrollment
    const enrollment = await Enrollment.create({ userId, courseId });

    // 3. Link to Course & User
    await Course.findByIdAndUpdate(courseId, { $push: { enrolledStudents: userId } });
    await User.findByIdAndUpdate(userId, { $push: { enrolledCourses: courseId } });

    // 4. Process Commission Split (If amount > 0)
    if (amount > 0) {
        const course = await Course.findById(courseId);
        const globalCommSetting = await Setting.findOne({ key: 'global_commission_percentage' });
        const commissionPercent = course.commissionRate > 0 ? course.commissionRate : (globalCommSetting ? globalCommSetting.value : 20);
        
        const adminShare = (amount * commissionPercent) / 100;
        const instructorShare = amount - adminShare;

        // Credit Instructor Wallet
        const instructor = await User.findById(course.instructor);
        instructor.walletBalance += instructorShare;
        await instructor.save();

        await WalletTransaction.create({
            userId: course.instructor,
            amount: instructorShare,
            type: 'credit',
            source: 'instructor_earnings',
            description: `Earnings for: ${course.courseTitle}`,
            metadata: { courseId, paymentId }
        });

        // Credit Admin Wallet
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            adminUser.walletBalance += adminShare;
            await adminUser.save();
            await WalletTransaction.create({
                userId: adminUser._id,
                amount: adminShare,
                type: 'credit',
                source: 'admin_commission',
                description: `Commission for: ${course.courseTitle}`,
                metadata: { courseId, paymentId }
            });
        }
    }

    return { success: true, enrollment };
};
