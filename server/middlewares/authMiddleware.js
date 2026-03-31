import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const authMiddleware = async (req, res, next) => {
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

export const adminAuth = [authMiddleware, authorize('admin', 'instructor')];

export const instructorApproved = (req, res, next) => {
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