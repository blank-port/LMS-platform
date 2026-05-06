import User from "../models/User.js";
import DeviceSession from "../models/DeviceSession.js";
import { UAParser } from 'ua-parser-js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

/**
 * UserService
 * Centralizes all user-related business logic, authentication, and session management.
 */

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const syncDeviceSession = async (userId, req) => {
    try {
        const parser = new UAParser(req.headers['user-agent'] || '');
        const ua = parser.getResult();
        const device = `${ua.os.name || 'Unknown'} ${ua.device.model || ''}`.trim();
        const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

        await DeviceSession.findOneAndUpdate(
            { userId, device, browser, ip },
            { lastActive: new Date() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('[UserService] Session Sync Error:', error.message);
    }
};

export const serializeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    profilePicture: user.avatar || '',
    isApproved: user.isApproved,
    isVerified: user.isVerified,
    wishlist: user.wishlist || [],
    referralCode: user.referralCode || ''
});

export const authenticateUser = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    return user;
};

export const createUser = async (userData) => {
    const normalizedRole = userData.role === 'educator' ? 'instructor' : userData.role === 'scholar' ? 'student' : userData.role;
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await User.create({
        ...userData,
        role: normalizedRole,
        password: hashedPassword,
        referralCode,
        isVerified: true // Assuming immediate verification for now, as per existing logic
    });

    return user;
};
