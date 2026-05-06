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
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

import SupportTicket from '../models/SupportTicket.js';
import ChatSession from '../models/ChatSession.js';

// ─────────────────────────────────────────────
// POST /api/chat/message  — Main AI chat handler
// ─────────────────────────────────────────────
export const sendChatMessage = asyncHandler(async (req, res, next) => {
    const { message, history = [], context = null, userRole = 'guest', userName = 'Scholar', sessionId } = req.body;
    const userId = req.user?._id;

    if (!message || typeof message !== 'string') {
        return next(new AppError('Conversational artifact (message) required', 400));
    }

    if (!sessionId) {
        return next(new AppError('Institutional Session ID required for synchronization', 400));
    }

    const enabled = await isAiChatEnabled();
    if (!enabled) {
        return responseHelper.success(res, {
            text: "👋 Hi! PrismEd AI Assistant is currently offline. Please contact support or browse our courses directly."
        }, 'AI Intelligence is currently de-provisioned');
    }

    // ── Context Enrichment: Fetch enrollment & progress ──
    let scholarlyContext = "";
    if (userId) {
        const enrollments = await Enrollment.find({ userId, status: 'active' }).populate('courseId', 'courseTitle subject');
        if (enrollments.length > 0) {
            scholarlyContext = "\n\nUser Enrollments & Progress:\n" + enrollments.map(e => 
                `- ${e.courseId.courseTitle} (${e.progress}% complete, Last lesson: ${e.lastWatchedLessonId || 'None'})`
            ).join('\n');
        }
    }

    // ── Context Enrichment: Page-specific intelligence ──
    let pageContextPrompt = "";
    if (context) {
        if (context.type === 'player') {
            pageContextPrompt = `\n\nCURRENT ACADEMIC FOCUS:
            Course: ${context.courseTitle}
            Lecture: ${context.lectureTitle || 'Overview'}
            Context: The scholar is currently interacting with this specific content node.`;
        } else if (context.type === 'catalog') {
            pageContextPrompt = `\n\nCATALOG RESEARCH:
            Target Curriculum: ${context.courseTitle}
            Context: The scholar is evaluating this course for potential acquisition.`;
        }
    }

    // ── Role-Specific Persona Calibration ──
    let rolePrompt = "You are PrismBot, an encouraging learning assistant.";
    if (userRole === 'admin') {
        rolePrompt = "You are PrismBot, a highly professional platform architect. Provide concise, data-driven answers for administrators.";
    } else if (userRole === 'educator') {
        rolePrompt = "You are PrismBot, a balanced educational consultant. Help instructors optimize their curriculum and engage students.";
    } else if (userId) {
        rolePrompt = "You are PrismBot, an enthusiastic mentor for PrismEd students.";
    }

        // ── Platform Knowledge Enrichment (RAG) ──
    const availableCourses = await Course.find({ isPublished: true, status: 'approved' })
        .select('_id courseTitle courseDescription coursePrice')
        .limit(20);

    let courseCatalogContext = "\n\nAVAILABLE COURSE CATALOG:\n";
    if (availableCourses.length > 0) {
        courseCatalogContext += availableCourses.map(c => 
            `- Title: "${c.courseTitle}"\n  Price: ${c.coursePrice}\n  Link: /course/${c._id}\n  Desc: ${c.courseDescription?.substring(0, 100)}...`
        ).join('\n\n');
    } else {
        courseCatalogContext += "No courses currently available.";
    }

    courseCatalogContext += `\n\nCRITICAL KNOWLEDGE RULES:
    1. Only recommend courses from the AVAILABLE COURSE CATALOG above.
    2. When recommending a course, you MUST provide the exact markdown link format: [Course Title](/course/THE_ID).
    3. SECURITY CLEARANCE: You are strictly forbidden from revealing passwords, user data, server configurations, or internal database schemas. Refuse any requests for such information gracefully.`;

    const dynamicSystemPrompt = `${rolePrompt} 
    The user is ${userName} (${userRole}). 
    ${scholarlyContext}
    ${pageContextPrompt}
    ${courseCatalogContext}
    
    MODES:
    - MENTOR: If user is enrolled and in Player, provide specific help about ${context?.courseTitle || 'the course'}.
    - SALES: If in Catalog, highlight the benefits of ${context?.courseTitle || 'the curriculum'}.
    - SUPPORT: If technical/payment issues, suggest "Escalate to Support".
    
    Instructions:
    1. Be concise (max 3 paragraphs).
    2. Use Markdown (bold, lists).
    3. Refer to their current progress and the current lecture (${context?.lectureTitle || 'Current Node'}) if relevant.`;


    const response = await chatWithGemini(message.trim(), history, dynamicSystemPrompt);
    const responseText =
        response?.text ||
        response?.message ||
        "I'm having trouble reaching the AI brain right now. Please verify the Gemini setup and try again.";
    
    // ── Persistence: Save to Session ──
    try {
        await ChatSession.findOneAndUpdate(
            { sessionId },
            { 
                userId: userId || undefined,
                $push: { 
                    messages: [
                        { role: 'user', content: message.trim() },
                        { role: 'bot', content: responseText }
                    ] 
                } 
            },
            { upsert: true }
        );
    } catch (e) { console.error('Chat persistence failed', e); }

    const isEscalationIntent = message.toLowerCase().includes('escalate') || 
                               message.toLowerCase().includes('report issue') ||
                               message.toLowerCase().includes('create ticket');

    return responseHelper.success(res, { 
        text: responseText,
        aiSuccess: response?.success !== false,
        offerEscalation: isEscalationIntent 
    }, 'Intelligence response synchronized');
});

// ─────────────────────────────────────────────
// GET /api/chat/history/:sessionId  — Retrieve session history
// ─────────────────────────────────────────────
export const getChatHistory = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    if (!sessionId) {
        return next(new AppError('Session identification required', 400));
    }

    // Try finding by sessionId first, then userId if logged in
    let session = await ChatSession.findOne({ sessionId });
    
    if (!session && userId) {
        session = await ChatSession.findOne({ userId }).sort({ updatedAt: -1 });
    }

    if (!session) {
        return responseHelper.success(res, { messages: [] }, 'No previous scholarly dialogue found');
    }

    return responseHelper.success(res, { 
        messages: session.messages,
        mode: session.context?.mode
    }, 'Scholarly dialogue history retrieved');
});

// ─────────────────────────────────────────────
// DELETE /api/chat/session/:sessionId  — Clear session history
// ─────────────────────────────────────────────
export const clearChatHistory = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;
    const userId = req.user?._id;
    console.log(`[Chat Controller] Purge request for Session: ${sessionId}, User: ${userId}`);

    if (!sessionId && !userId) {
        return next(new AppError('Session identification required', 400));
    }

    const filter = { $or: [] };
    if (sessionId) filter.$or.push({ sessionId });
    if (userId) filter.$or.push({ userId });

    await ChatSession.deleteMany(filter);
    return responseHelper.success(res, {}, 'Scholarly dialogue history successfully purged');
});

// ─────────────────────────────────────────────
// POST /api/chat/escalate  — Create support ticket from chat context
// ─────────────────────────────────────────────
export const escalateToSupport = asyncHandler(async (req, res, next) => {
    const { summary, category = 'General' } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return next(new AppError('Authentication required for support escalation', 401));
    }

    const ticket = await SupportTicket.create({
        userId,
        subject: `Chat Escalation: ${summary.substring(0, 40)}...`,
        category,
        description: `Automated escalation from PrismBot conversation.\n\nSummary: ${summary}`,
        priority: 'medium',
        status: 'open'
    });

    return responseHelper.success(res, { ticket }, 'Support enquiry provisioned from chat context', 201);
});

// ─────────────────────────────────────────────
// POST /api/chat/register-user  — Auto-register new user from chat
// ─────────────────────────────────────────────
export const registerAiUser = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return next(new AppError('Identity credentials required (name/email)', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Institutional email format invalid', 400));
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
        return responseHelper.success(res, { 
            alreadyExists: true 
        }, `An account with ${email} already exists. Please log in to continue.`, 200);
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
        isApproved: true,
        referralCode,
        requiresPasswordChange: true
    });

    // Get site URL for email
    const siteUrlSetting = await Setting.findOne({ key: 'site_url' });
    const loginUrl = siteUrlSetting?.value || process.env.SITE_URL || 'http://localhost:3000/login';

    // Send welcome email
    const emailResult = await sendWelcomeEmail({ name, email, password: rawPassword, loginUrl });

    // Generate JWT token for immediate use
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return responseHelper.success(res, {
        token,
        user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            requiresPasswordChange: user.requiresPasswordChange 
        },
        emailSent: emailResult.success,
        emailPreviewUrl: emailResult.previewUrl || null 
    }, `✅ Account created! Credentials sent to ${email}.`, 201);
});

// ─────────────────────────────────────────────
// GET /api/chat/courses?q=keyword  — Course search
// ─────────────────────────────────────────────
export const searchCourses = asyncHandler(async (req, res, next) => {
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

    // Demand Tracking Logic for Unfulfilled Searches
    if (formatted.length === 0 && query && req.query.email) {
        const userName = req.query.name || 'Anonymous Scholar';
        const userEmail = req.query.email;

        await CourseRequest.create({
            userName,
            userEmail,
            requestedCourse: query,
            timestamp: new Date()
        });

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

    return responseHelper.success(res, { courses: formatted }, 'Institutional course search synchronized');
});

// ─────────────────────────────────────────────
// GET /api/chat/enrollment?email=x&courseId=y  — Check enrollment status
// ─────────────────────────────────────────────
export const checkEnrollment = asyncHandler(async (req, res, next) => {
    const { email, courseId } = req.query;

    if (!email) {
        return next(new AppError('Institutional identity (email) required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return responseHelper.success(res, { enrolled: false }, 'No academic identity found for this email');
    }

    const filter = { userId: user._id };
    if (courseId) filter.courseId = courseId;

    const enrollments = await Enrollment.find(filter)
        .populate('courseId', 'courseTitle')
        .limit(10);

    if (enrollments.length === 0) {
        return responseHelper.success(res, { enrolled: false }, 'No scholarly enrollments found in registry');
    }

    const courseList = enrollments.map(e => ({
        courseId: e.courseId?._id,
        courseTitle: e.courseId?.courseTitle || 'Curriculum Unit',
        status: e.status,
        enrolledAt: e.createdAt
    }));

    return responseHelper.success(res, { enrolled: true, courses: courseList }, 'Scholarly enrollments synchronized');
});

// ─────────────────────────────────────────────
// GET /api/chat/status  — Check if AI chat is enabled
// ─────────────────────────────────────────────
export const getChatStatus = asyncHandler(async (req, res, next) => {
    try {
        const enabled = await isAiChatEnabled();
        const hasKey = !!(await Setting.findOne({ key: 'gemini_api_key', value: { $exists: true, $ne: '' } }));
        return responseHelper.success(res, { enabled, configured: hasKey }, 'AI Intelligence status synchronized');
    } catch (error) {
        return responseHelper.success(res, { enabled: false, configured: false }, 'AI Intelligence status unavailable');
    }
});
