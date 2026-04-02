import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Get Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const statsArray = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'instructor' }),
            Course.countDocuments(),
            Enrollment.countDocuments(),
            Course.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'instructor', isApproved: false })
        ]);

        const [totalUsers, totalStudents, totalInstructors, totalCourses, totalEnrollments, pendingCourses, pendingInstructors] = statsArray;

        res.json({
            success: true,
            stats: {
                totalUsers, totalStudents, totalInstructors,
                totalCourses, totalEnrollments, pendingCourses, pendingInstructors
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Users (with institutional pagination)
export const getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 10 } = req.query;
        let query = {};
        if (role) query.role = role;
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);
        res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get User By ID (Detailed Profile)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Identity not found in repository.' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create User
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const bcrypt = (await import('bcrypt')).default;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword, role,
            isApproved: true
        });

        res.json({ success: true, message: 'User created', user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update User
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isApproved } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (isApproved !== undefined) updateData.isApproved = isApproved;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User updated', user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Instructors (with institutional pagination)
export const getAllInstructors = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const instructors = await User.find({ role: 'instructor' })
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments({ role: 'instructor' });
        res.json({ success: true, instructors, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Approve/Reject Instructor
export const approveInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        const instructor = await User.findByIdAndUpdate(
            id,
            { isApproved },
            { new: true }
        ).select('-password');

        if (!instructor) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }

        // Real-time Relay: Alert Educator of Authorization State
        const PushNotificationService = (await import('../services/PushNotificationService.js')).default;
        await PushNotificationService.broadcast(`user-${id}`, 'authorization-update', {
            status: isApproved ? 'APPROVED' : 'REVOKED',
            message: isApproved ? 'Your scholarly credentials have been authorized.' : 'Your educator privileges have been suspended.',
            type: 'IDENTITY'
        });

        res.json({
            success: true,
            message: isApproved ? 'Instructor approved' : 'Instructor rejected',
            instructor
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Courses (Admin)
export const getAllCoursesAdmin = async (req, res) => {
    try {
        const { category } = req.query;

        let query = {};
        if (category && category !== 'null' && category !== 'undefined' && category !== '') {
            try {
                query.category = new mongoose.Types.ObjectId(category);
            } catch (err) {
                // Silently fail if ID is malformed
            }
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, courses });
    } catch (error) {
        console.error('Admin Course Fetch Error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Approve/Reject Course
export const updateCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const course = await Course.findByIdAndUpdate(id, { status }, { new: true }).populate('instructor', 'name');
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Real-time Relay: Alert Instructor of Course Lifecycle State
        const PushNotificationService = (await import('../services/PushNotificationService.js')).default;
        await PushNotificationService.broadcast(`user-${course.instructor._id}`, 'course-status-update', {
            courseTitle: course.courseTitle,
            status: status.toUpperCase(),
            message: `Your course "${course.courseTitle}" has been ${status}.`
        });

        res.json({ success: true, message: `Course ${status}`, course });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Course (Full Admin Access)
export const updateCourseAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseData } = req.body;
        const imageFile = req.file;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const parsedData = JSON.parse(courseData);
        Object.assign(course, parsedData);

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            course.courseThumbnail = imageUpload.secure_url;
        }

        await course.save();
        res.json({ success: true, message: 'Course updated perfectly by Admin' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Course (Admin)
export const deleteCourseAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await Course.findByIdAndDelete(id);
        await Enrollment.deleteMany({ courseId: id });
        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }
        const category = await Category.create({ name, description });
        res.json({ success: true, message: 'Category created', category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            id, { name, description }, { new: true }
        );
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated', category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Global Scholar Mastery Data (Reports)
export const getScholarPerformance = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name email');
        
        const performanceData = await Promise.all(students.map(async (student) => {
            const enrollments = await Enrollment.find({ userId: student._id });
            const attempts = await QuizAttempt.find({ userId: student._id });

            // Calculate Curricular Saturation (Progress)
            let totalProgress = 0;
            if (enrollments.length > 0) {
                const totalSaturation = enrollments.reduce((acc, curr) => {
                    const progress = curr.courseContent?.length > 0 
                        ? (curr.completedLectures?.length / curr.courseContent.length) * 100 
                        : 0;
                    return acc + progress;
                }, 0);
                totalProgress = totalSaturation / enrollments.length;
            }

            // Calculate Assessment Mastery (Avg Score)
            let avgScore = 0;
            if (attempts.length > 0) {
                const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
                avgScore = totalScore / attempts.length;
            }

            return {
                name: student.name,
                email: student.email,
                completion: Math.round(totalProgress || 0),
                avgScore: Math.round(avgScore || 0)
            };
        }));

        res.json({ 
            success: true, 
            performance: performanceData.sort((a, b) => b.avgScore - a.avgScore) 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Instructor Payout Management ────────────────────────────────────
export const getAllPayouts = async (req, res) => {
    try {
        const { instructor, status, startDate, endDate } = req.query;
        let query = { source: 'withdrawal' };

        if (instructor && instructor !== 'undefined') query.userId = instructor;
        if (status && status !== 'undefined') query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const payouts = await WalletTransaction.find(query)
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json({ success: true, payouts });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updatePayoutStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['success', 'failed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status transition.' });
        }

        const payout = await WalletTransaction.findByIdAndUpdate(id, { status }, { new: true })
            .populate('userId', 'name email');

        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout record not found.' });
        }

        // Real-time Relay: Alert Instructor of Financial State Transition
        const PushNotificationService = (await import('../services/PushNotificationService.js')).default;
        await PushNotificationService.broadcast(`user-${payout.userId._id}`, 'payout-status-update', {
            amount: payout.amount,
            status: status.toUpperCase(),
            message: `Your payout request for ${payout.amount} has been ${status === 'success' ? 'authorized and processed.' : 'rejected by administration.'}`
        });

        res.json({ success: true, message: `Payout marked as ${status}`, payout });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

