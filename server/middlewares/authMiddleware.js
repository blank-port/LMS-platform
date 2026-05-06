import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const authMiddleware = async (req, res, next) => {
    console.log(`\n--- [Auth Pulse] Incoming: ${req.method} ${req.originalUrl} ---`);
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        
        // Strategic Pulse: Track activity with 5-minute thermal cooldown to optimize write throughput
        const lastActiveThreshold = 5 * 60 * 1000;
        const timeSinceLastActive = new Date() - new Date(user.lastActive || 0);

        if (timeSinceLastActive > lastActiveThreshold) {
            await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
        }

        // Security Protocol Implementation: Mandate Password Change
        const isBypassRoute = req.originalUrl.includes('/change-password') || 
                             req.originalUrl.includes('/profile') || 
                             req.originalUrl.includes('/data') ||
                             req.originalUrl.includes('/cohort') ||
                             req.originalUrl.includes('/course') ||
                             req.originalUrl.includes('/notification');

        if (user.requiresPasswordChange && !isBypassRoute) {
            return res.status(403).json({ 
                success: false, 
                message: 'Security Protocol Violation: Password synchronization required before further platform interaction.',
                requiresPasswordChange: true 
            });
        }

        next();

    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            console.log(`Auth Failed: User ${req.user.email} with role '${req.user.role}' tried to access route requiring roles: ${roles}`);
            return res.status(403).json({ success: false, message: 'Not authorized for this action' });
        }
        next();
    };
};

export const adminAuth = [authMiddleware, authorize('admin', 'staff')];

export const instructorApproved = (req, res, next) => {
    // Strategic Bypass: Admins and Staff possess inherent authorization
    if (req.user.role === 'admin' || req.user.role === 'staff') {
        return next();
    }

    if (req.user.role === 'instructor' && !req.user.isApproved) {
        return res.status(403).json({ 
            success: false, 
            message: 'Your instructor account is pending admin approval. You will have full access once approved.' 
        });
    }
    next();
};

export const instructorAuth = [authMiddleware, authorize('instructor', 'admin'), instructorApproved];
export const studentAuth = [authMiddleware, authorize('student', 'instructor', 'admin')];

// Strategic Aliases for Phased Integration
export const protectUser = studentAuth;
export const protectInstructor = instructorAuth;
export const protectAdmin = adminAuth;

export const optionalUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};