import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Setting from '../models/Setting.js';
import AppError from '../utils/appError.js';

/**
 * AdminService
 * Handles high-level administrative operations, system audits, and global reporting.
 */

export const getPlatformStats = async () => {
    const statsArray = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'scholar' }), // Aligning terminology
        User.countDocuments({ role: 'educator' }), // Aligning terminology
        Course.countDocuments(),
        Enrollment.countDocuments(),
        Course.countDocuments({ status: 'pending' }),
        User.countDocuments({ role: 'instructor', isApproved: false }) // Temporary fallback for legacy role
    ]);

    const [totalUsers, totalStudents, totalInstructors, totalCourses, totalEnrollments, pendingCourses, pendingInstructors] = statsArray;

    return {
        totalUsers, totalStudents, totalInstructors,
        totalCourses, totalEnrollments, pendingCourses, pendingInstructors
    };
};

export const updateGlobalSetting = async (key, value) => {
    const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
    );
    return setting;
};

export const auditPayoutRequests = async (filters = {}) => {
    const query = { source: 'withdrawal', ...filters };
    return await WalletTransaction.find(query)
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 });
};

export const processCertificateTemplate = async (templateData, isDefault = false) => {
    const CertificateTemplate = (await import('../models/CertificateTemplate.js')).default;
    
    if (isDefault) {
        await CertificateTemplate.updateMany({}, { isDefault: false });
    }

    return await CertificateTemplate.create({ ...templateData, isDefault });
};
