import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { chatWithGemini, isAiChatEnabled } from '../services/geminiService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import Setting from '../models/Setting.js';
import CourseRequest from '../models/CourseRequest.js';
import Notification from '../models/Notification.js';

// ─────────────────────────────────────────────
// POST /api/chat/message  — Main AI chat handler
// ─────────────────────────────────────────────
export const sendChatMessage = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, text: 'No message provided.' });
        }

        const enabled = await isAiChatEnabled();
        if (!enabled) {
            return res.json({
                success: true,
                text: "👋 Hi! PrismEd AI Assistant is currently offline. Please contact support or browse our courses directly."
            });
        }

        const response = await chatWithGemini(message.trim(), history);
        res.json({ success: response.success, text: response.text });
    } catch (error) {
        console.error('[ChatController] Critical Error:', error.message);
        res.status(500).json({ 
            success: false, 
            text: "I'm having a bit of trouble connecting to the AI brain. Please try again in a moment! 🔄" 
        });
    }
};

// ─────────────────────────────────────────────
// POST /api/chat/register-user  — Auto-register new user from chat
// ─────────────────────────────────────────────
export const registerAiUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required.' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({
                success: false,
                alreadyExists: true,
                message: `An account with ${email} already exists. Please log in to continue.`
            });
        }

        // Generate secure 10-char password
        const rawPassword = Math.random().toString(36).slice(-5).toUpperCase() +
                            Math.random().toString(36).slice(-4) +
                            String(Math.floor(Math.random() * 90) + 10);
        
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            isApproved: true,
            referralCode
        });

        // Get site URL for email
        const siteUrlSetting = await Setting.findOne({ key: 'site_url' });
        const loginUrl = siteUrlSetting?.value || process.env.SITE_URL || 'http://localhost:3000/login';

        // Send welcome email
        const emailResult = await sendWelcomeEmail({ name, email, password: rawPassword, loginUrl });

        // Generate JWT token for immediate use
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: `✅ Account created! Credentials sent to ${email}.`,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
            emailSent: emailResult.success,
            emailPreviewUrl: emailResult.previewUrl || null // Ethereal test URL
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/chat/courses?q=keyword  — Course search
// ─────────────────────────────────────────────
export const searchCourses = async (req, res) => {
    try {
        const { q = '' } = req.query;
        const query = q.trim();

        const filter = {
            ...(query && {
                $or: [
                    { courseTitle: { $regex: query, $options: 'i' } },
                    { courseDescription: { $regex: query, $options: 'i' } },
                    { subject: { $regex: query, $options: 'i' } }
                ]
            })
        };

        const courses = await Course.find(filter)
            .select('courseTitle courseDescription coursePrice level courseThumbnail instructor _id')
            .populate('instructor', 'name')
            .limit(6)
            .sort({ createdAt: -1 });

        const formatted = courses.map(c => ({
            id: c._id,
            title: c.courseTitle,
            description: c.courseDescription?.substring(0, 160) + (c.courseDescription?.length > 160 ? '...' : ''),
            price: c.coursePrice,
            level: c.level,
            thumbnail: c.courseThumbnail,
            instructor: c.instructor?.name || 'PrismEd Instructor',
            enrollUrl: `/course/${c._id}`
        }));

        // ─────────────────────────────────────────────
        // Demand Tracking Logic for Unfulfilled Searches
        // ─────────────────────────────────────────────
        if (formatted.length === 0 && query && req.query.email) {
            const userName = req.query.name || 'Anonymous Scholar';
            const userEmail = req.query.email;

            // 1. Persist the request for institutional analysis
            await CourseRequest.create({
                userName,
                userEmail,
                requestedCourse: query,
                timestamp: new Date()
            });

            // 2. Transmit notification to the administration
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                 await Notification.create({
                     user: admin._id,
                     type: 'COURSE_REQUEST',
                     message: `Strategic Intelligence: ${userName} (${userEmail}) requested a missing course: "${query}". 🔍`,
                     module: 'system'
                 });
            }
        }

        res.json({ success: true, courses: formatted, total: formatted.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/chat/enrollment?email=x&courseId=y  — Check enrollment status
// ─────────────────────────────────────────────
export const checkEnrollment = async (req, res) => {
    try {
        const { email, courseId } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: true, enrolled: false, message: 'No account found for this email.' });
        }

        const filter = { userId: user._id };
        if (courseId) filter.courseId = courseId;

        const enrollments = await Enrollment.find(filter)
            .populate('courseId', 'courseTitle')
            .limit(10);

        if (enrollments.length === 0) {
            return res.json({ success: true, enrolled: false, message: 'Not enrolled in any courses yet.' });
        }

        const courseList = enrollments.map(e => ({
            courseId: e.courseId?._id,
            courseTitle: e.courseId?.courseTitle || 'Course',
            status: e.status,
            enrolledAt: e.createdAt
        }));

        res.json({ success: true, enrolled: true, courses: courseList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/chat/status  — Check if AI chat is enabled
// ─────────────────────────────────────────────
export const getChatStatus = async (req, res) => {
    try {
        const enabled = await isAiChatEnabled();
        const hasKey = !!(await Setting.findOne({ key: 'gemini_api_key', value: { $exists: true, $ne: '' } }));
        res.json({ success: true, enabled, configured: hasKey });
    } catch (error) {
        res.json({ success: true, enabled: false, configured: false });
    }
};
