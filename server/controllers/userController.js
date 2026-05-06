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

import { sendOTP } from "../services/emailService.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

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
export const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const userRole = role === 'instructor' ? 'instructor' : 'student';

    // Governance Protocol Audit
    if (userRole === 'student') {
        const publicReg = await Setting.findOne({ key: 'public_registration' });
        if (publicReg && publicReg.value === false) {
            return next(new AppError('Public student registration is currently offline.', 403));
        }
    } else if (userRole === 'instructor') {
        const instructorReg = await Setting.findOne({ key: 'instructor_registration' });
        if (instructorReg && instructorReg.value === false) {
            return next(new AppError('Instructor on-boarding is currently closed.', 403));
        }
    }

    const existingUser = await User.findOne({ email });
    
    if (existingUser && existingUser.isVerified) {
        return next(new AppError('Email already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Check for Referring Scholar
    let referrer = null;
    if (req.body.referralCode) {
        referrer = await User.findOne({ referralCode: req.body.referralCode.toUpperCase() });
    }

    // OTP Intelligence
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours

    let user;
    if (existingUser && !existingUser.isVerified) {
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.role = userRole;
        existingUser.verifyOtp = otp;
        existingUser.verifyOtpExpire = otpExpire;
        existingUser.isVerified = false; 
        await existingUser.save();
        user = existingUser;
    } else {
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            isApproved: userRole === 'student' ? true : false,
            referralCode,
            referredBy: referrer ? referrer._id : null,
            verifyOtp: otp,
            verifyOtpExpire: otpExpire,
            isVerified: false 
        });
    }

    // Dispatch OTP via Digital Post (Keeping it in the background)
    sendOTP(email, otp); 

    const token = generateToken(user._id);

    return responseHelper.success(res, {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            requiresPasswordChange: user.requiresPasswordChange
        }
    }, 'Registration successful! Access granted.', 201);
});

// Verify OTP
export const verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (user.isVerified) {
        return next(new AppError('Account already verified', 400));
    }

    if (user.verifyOtp !== otp || user.verifyOtpExpire < Date.now()) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    // Activate Identity
    user.isVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpire = 0;
    await user.save();

    // Finalize Scholar On-boarding
    await grantPoints(user._id, 'registration');
    if (user.referredBy) {
        await grantPoints(user.referredBy, 'referral_success');
    }

    const token = generateToken(user._id);

    responseHelper.success(res, {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            requiresPasswordChange: user.requiresPasswordChange
        }
    }, 'Email verified successfully');

    // Notify Admin
    await createAdminNotification({
        type: 'NEW_USER',
        message: `Verified scholar registered: ${user.name} (${email})`,
        module: 'users',
        referenceId: user._id
    });
});

// Resend OTP
export const resendOtp = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (user.isVerified) {
        return next(new AppError('Account already verified', 400));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
        return next(new AppError('Failed to dispatch verification email. Please check SMTP configuration.', 500));
    }

    return responseHelper.success(res, {}, 'New OTP dispatched to your inbox');
});

// Login
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Invalid credentials', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid credentials', 400));
    }

    const token = generateToken(user._id);

    // Session Tracking & Sync
    await syncDeviceSession(user._id, req);

    // Grant login points
    await grantPoints(user._id, 'login');

    return responseHelper.success(res, {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar || '',
            profilePicture: user.avatar || '',
            isApproved: user.isApproved,
            requiresPasswordChange: user.requiresPasswordChange
        }
    }, 'Login successful');
});

// Google Login
export const googleLogin = asyncHandler(async (req, res, next) => {
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
            return next(new AppError('Google Registration is unavailable as public sign-up is offline.', 403));
        }

        // Register new user via Google
         user = await User.create({
            name,
            email,
            password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
            role: 'student',
            avatar: picture,
            isApproved: true
        });
    }

    const token = generateToken(user._id);

    // Session Tracking & Sync
    await syncDeviceSession(user._id, req);

    // Grant login points
    await grantPoints(user._id, 'login');

    return responseHelper.success(res, {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar || picture || '',
            profilePicture: user.avatar || picture || '',
            isApproved: user.isApproved,
            requiresPasswordChange: user.requiresPasswordChange
        }
    }, 'Google Login successful');
});

// Get Profile
export const getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('-password').populate('enrolledCourses');
    if (!user) return next(new AppError('Profile not found', 404));
    
    // Ensure current device session is recorded
    await syncDeviceSession(user._id, req);

    return responseHelper.success(res, { user });
});

// Update Profile (Universal Identity Sync)
export const updateProfile = asyncHandler(async (req, res, next) => {
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
    
    if (!user) return next(new AppError('Failed to update profile identity', 404));

    responseHelper.success(res, { user }, 'Profile updated successfully');

    // Grant reward for digital identity synchronization (profile completion)
    await grantPoints(req.user._id, 'profile_update');
});

// Get User Data (for context)
export const getUserData = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return next(new AppError('User Not Found', 404));
    }
    return responseHelper.success(res, { user });
});

// Update Account Profile (Name, Phone, About, Avatar)
export const updateAccountProfile = asyncHandler(async (req, res, next) => {
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

    if (!user) return next(new AppError('Failed to synchronize primary identity', 404));

    return responseHelper.success(res, { user }, 'Primary identity synchronized');
});

// Change Password
export const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return next(new AppError('Current password verification failed', 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.requiresPasswordChange = false;
    await user.save();

    return responseHelper.success(res, {}, 'Security layer updated');
});

// Update Secondary Details (Education, Experience, Skills, Financial, Social, Settings)
export const updateSecondaryDetails = asyncHandler(async (req, res, next) => {
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

    if (!user) return next(new AppError('Failed to synchronize extended profile', 404));

    return responseHelper.success(res, { user }, 'Extended profile synchronized');
});

// Delete Account
export const deleteAccount = asyncHandler(async (req, res, next) => {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Authorization failed for account termination', 401));
    }

    await User.findByIdAndDelete(req.user._id);
    return responseHelper.success(res, {}, 'Account permanently removed from registry');
});

// --- Security: Device Sessions ---

export const getLoggedDevices = asyncHandler(async (req, res, next) => {
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

    return responseHelper.success(res, { sessions: enhancedSessions });
});

export const revokeDeviceSession = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;
    await DeviceSession.findOneAndDelete({ _id: sessionId, userId: req.user._id });
    return responseHelper.success(res, {}, 'Session terminated');
});

// --- Referrals ---

export const getReferralStats = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('referralCode');
    const referrals = await User.find({ referredBy: req.user._id }).select('name email createdAt');
    
    return responseHelper.success(res, { 
        referralCode: user.referralCode,
        referralCount: referrals.length,
        referrals 
    });
});

// --- Purchase History ---

export const getPurchaseHistory = asyncHandler(async (req, res, next) => {
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

    return responseHelper.success(res, { history });
});

// --- Wishlist Management ---

export const toggleWishlist = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('Institutional profile not found', 404));

    const index = user.wishlist.indexOf(courseId);
    if (index > -1) {
        user.wishlist.splice(index, 1);
        await user.save();
        return responseHelper.success(res, { action: 'removed' }, 'Removed from wishlist');
    } else {
        user.wishlist.push(courseId);
        await user.save();
        return responseHelper.success(res, { action: 'added' }, 'Added to wishlist');
    }
});

export const getWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'wishlist',
            select: 'courseTitle courseThumbnail coursePrice discount level courseContent',
            populate: { path: 'instructor', select: 'name' }
        });
    if (!user) return next(new AppError('Institutional profile not found', 404));
    return responseHelper.success(res, { wishlist: user.wishlist });
});

// --- Password Recovery (OTP Pattern) ---

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // For security, do not reveal if user exists or not if we want to prevent enumeration,
    // but the prompt says "Implement forgotPassword and resetPassword... simple and stable".
    // Usually, we return success even if user not found to prevent enumeration, 
    // but let's follow the standard pattern of this LMS if any. 
    // Looking at verifyEmail, it returns 404 if user not found.
    if (!user) {
        return next(new AppError('Institutional profile with this email not found', 404));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpire = Date.now() + 60 * 60 * 1000; // 1 Hour
    await user.save();

    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
        return next(new AppError('Failed to dispatch recovery OTP', 500));
    }

    return responseHelper.success(res, {}, 'Recovery OTP dispatched to your inbox');
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('Institutional profile not found', 404));
    }

    if (user.verifyOtp !== otp || user.verifyOtpExpire < Date.now()) {
        return next(new AppError('Invalid or expired recovery OTP', 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verifyOtp = '';
    user.verifyOtpExpire = 0;
    user.isVerified = true; // Mark verified if they reset password
    await user.save();

    return responseHelper.success(res, {}, 'Identity secured. Password updated successfully.');
});