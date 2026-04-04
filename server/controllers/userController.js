import User from "../models/User.js";
import Setting from "../models/Setting.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { grantPoints } from "../services/gamificationService.js";
import { createAdminNotification } from "../services/notificationService.js";
import PointHistory from "../models/PointHistory.js";
import { v2 as cloudinary } from 'cloudinary';
import DeviceSession from "../models/DeviceSession.js";
import Referral from "../models/Referral.js";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import { UAParser } from 'ua-parser-js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper: Synchronize Device Session (Module: Security)
const syncDeviceSession = async (userId, req) => {
    try {
        const parser = new UAParser(req.headers['user-agent'] || '');
        const ua = parser.getResult();
        const device = `${ua.os.name || 'Unknown'} ${ua.device.model || ''}`.trim();
        const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

        // Upsert session (Fingerprint: User + Device + Browser + IP)
        await DeviceSession.findOneAndUpdate(
            { userId, device, browser, ip },
            { lastActive: new Date() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Session Sync Error:', error);
    }
};

// Register
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userRole = role === 'instructor' ? 'instructor' : 'student';

        // Governance Protocol Audit
        if (userRole === 'student') {
            const publicReg = await Setting.findOne({ key: 'public_registration' });
            if (publicReg && publicReg.value === false) {
                return res.status(403).json({ success: false, message: 'Public student registration is currently offline.' });
            }
        } else if (userRole === 'instructor') {
            const instructorReg = await Setting.findOne({ key: 'instructor_registration' });
            if (instructorReg && instructorReg.value === false) {
                return res.status(403).json({ success: false, message: 'Instructor on-boarding is currently closed.' });
            }
        }

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Unique Referral Code (8 characters)
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Check for Referring Scholar
        let referrer = null;
        if (req.body.referralCode) {
            referrer = await User.findOne({ referralCode: req.body.referralCode.toUpperCase() });
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            isApproved: userRole === 'student' ? true : false,
            referralCode,
            referredBy: referrer ? referrer._id : null
        });

        // Grant registration points to new scholar
        await grantPoints(user._id, 'registration');

        // Grant referral points to referring scholar
        if (referrer) {
            await grantPoints(referrer._id, 'referral_success');
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isApproved: user.isApproved
            }
        });

        // Notify Admin of New User
        await createAdminNotification({
            type: 'NEW_USER',
            message: `New ${userRole} registered: ${name} (${email})`,
            module: 'users',
            referenceId: user._id
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        // Session Tracking & Sync
        await syncDeviceSession(user._id, req);

        // Grant login points
        await grantPoints(user._id, 'login');

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Google Login
export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Governance Protocol Audit for Google Registration
            const publicReg = await Setting.findOne({ key: 'public_registration' });
            if (publicReg && publicReg.value === false) {
                return res.status(403).json({ success: false, message: 'Google Registration is unavailable as public sign-up is offline.' });
            }

            // Register new user via Google
             user = await User.create({
                name,
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
                role: 'student',
                profilePicture: picture,
                isApproved: true
            });
        }

        const token = generateToken(user._id);

        // Session Tracking & Sync
        await syncDeviceSession(user._id, req);

        // Grant login points
        await grantPoints(user._id, 'login');

        res.json({
            success: true,
            message: 'Google Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture || picture,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('enrolledCourses');
        
        // Ensure current device session is recorded
        await syncDeviceSession(user._id, req);

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Profile (Universal Identity Sync)
export const updateProfile = async (req, res) => {
    try {
        const { 
            name, phone, about, headline, language, dob, 
            education, experience, skills, socialLinks, 
            payoutSettings 
        } = req.body;
        
        const updateData = {};

        // Primary Identity
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (about) updateData.about = about;
        if (headline) updateData.headline = headline;
        if (language) updateData.language = language;
        if (dob) updateData.dob = dob;

        // Secondary Vectors (Parsed if stringified from form-data)
        if (education) updateData.education = typeof education === 'string' ? JSON.parse(education) : education;
        if (experience) updateData.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
        if (skills) updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
        if (socialLinks) updateData.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        if (payoutSettings) updateData.payoutSettings = typeof payoutSettings === 'string' ? JSON.parse(payoutSettings) : payoutSettings;

        // Avatar Handling
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path);
            updateData.avatar = imageUpload.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');
        
        res.json({ success: true, user });

        // Grant reward for digital identity synchronization (profile completion)
        await grantPoints(req.user._id, 'profile_update');

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User Data (for context)
export const getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Account Profile (Name, Phone, About, Avatar)
export const updateAccountProfile = async (req, res) => {
    try {
        const { name, phone, about } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (about) updateData.about = about;
        
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path);
            updateData.avatar = imageUpload.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ success: true, message: 'Primary identity synchronized', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password verification failed' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Security layer updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Secondary Details (Education, Experience, Skills, Financial, Social, Settings)
export const updateSecondaryDetails = async (req, res) => {
    try {
        const { 
            education, experience, skills, 
            financial, socialLinks, notificationSettings, language 
        } = req.body;
        
        const updateData = {};
        if (education) updateData.education = education;
        if (experience) updateData.experience = experience;
        if (skills) updateData.skills = skills;
        if (financial) updateData.financial = financial;
        if (socialLinks) updateData.socialLinks = socialLinks;
        if (notificationSettings) updateData.notificationSettings = notificationSettings;
        if (language) updateData.language = language;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ success: true, message: 'Extended profile synchronized', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Account
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Authorization failed for account termination' });
        }

        await User.findByIdAndDelete(req.user._id);
        res.json({ success: true, message: 'Account permanently removed from registry' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Security: Device Sessions ---

export const getLoggedDevices = async (req, res) => {
    try {
        const sessions = await DeviceSession.find({ userId: req.user._id }).sort({ lastActive: -1 });
        
        // Identify "isCurrent" dynamically based on request fingerprint
        const parser = new UAParser(req.headers['user-agent'] || '');
        const ua = parser.getResult();
        const currentDevice = `${ua.os.name || 'Unknown'} ${ua.device.model || ''}`.trim();
        const currentBrowser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
        const currentIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

        const enhancedSessions = sessions.map(s => ({
            ...s._doc,
            isCurrent: s.device === currentDevice && s.browser === currentBrowser && s.ip === currentIp
        }));

        res.json({ success: true, sessions: enhancedSessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const revokeDeviceSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        await DeviceSession.findOneAndDelete({ _id: sessionId, userId: req.user._id });
        res.json({ success: true, message: 'Session terminated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Referrals ---

export const getReferralStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('referralCode');
        const referrals = await User.find({ referredBy: req.user._id }).select('name email createdAt');
        
        res.json({ 
            success: true, 
            referralCode: user.referralCode,
            referralCount: referrals.length,
            referrals 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Purchase History ---

export const getPurchaseHistory = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user._id })
            .populate('courseId', 'courseTitle courseThumbnail coursePrice')
            .sort({ createdAt: -1 });

        const history = enrollments.map(e => ({
            id: e._id,
            item: e.courseId?.courseTitle || 'Quantum Curriculum',
            thumbnail: e.courseId?.courseThumbnail,
            date: e.createdAt,
            status: 'Confirmed',
            price: e.courseId?.coursePrice > 0 ? `₹${e.courseId.coursePrice}` : 'Scholarship'
        }));

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};