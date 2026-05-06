import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Setting from '../models/Setting.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * EducatorService
 * Encapsulates business logic for educator operations, course management, and financial reporting.
 */

export const getCourseApprovalPolicy = async () => {
    const setting = await Setting.findOne({ key: 'course_approval' });
    return setting ? setting.value === 'Yes' : true;
};

export const createCourse = async (courseData, instructorId, imageFile) => {
    const requiresApproval = await getCourseApprovalPolicy();
    
    const data = {
        ...courseData,
        instructor: instructorId,
        status: requiresApproval ? 'pending' : 'approved',
        isPublished: true
    };

    const course = await Course.create(data);

    if (imageFile) {
        const upload = await cloudinary.uploader.upload(imageFile.path);
        course.courseThumbnail = upload.secure_url;
        await course.save();
    }

    return course;
};

export const getEducatorDashboardStats = async (educatorId) => {
    const courses = await Course.find({ instructor: educatorId }).populate('category', 'name');
    const courseIds = courses.map(c => c._id);

    const totalEnrollments = await Enrollment.countDocuments({ courseId: { $in: courseIds } });
    
    const transactions = await WalletTransaction.find({
        userId: educatorId,
        source: 'instructor_earnings', // Should probably update to 'educator_earnings' eventually
        status: 'success'
    });

    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

    // Calculate unique subjects/categories
    const totalSubjects = new Set(courses.map(c => c.category?.name || 'Uncategorized')).size;

    return {
        totalCourses: courses.length,
        totalEnrollments,
        totalRevenue,
        totalSubjects,
        courses
    };
};

export const calculateRevenueBreakdown = (transactions) => {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRevenue = transactions
        .filter(t => new Date(t.createdAt) >= startOfToday)
        .reduce((acc, t) => acc + t.amount, 0);

    const thisMonthRevenue = transactions
        .filter(t => new Date(t.createdAt) >= startOfMonth)
        .reduce((acc, t) => acc + t.amount, 0);

    return { todayRevenue, thisMonthRevenue };
};
