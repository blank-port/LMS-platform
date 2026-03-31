import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
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

// Get All Users (with optional role filtering)
export const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        if (role) query.role = role;
        
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
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

// Get All Instructors
export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, instructors });
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

        const course = await Course.findByIdAndUpdate(id, { status }, { new: true });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

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

