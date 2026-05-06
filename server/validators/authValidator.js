import { body } from 'express-validator';

/**
 * Authentication Validation Schemas
 * Enforces strict input rules for sensitive auth routes.
 */

export const registerSchema = [
    body('name')
        .trim()
        .notEmpty().withMessage('Scientific name is required.')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Institutional email is required.')
        .isEmail().withMessage('Please provide a valid email protocol.'),
    
    body('password')
        .notEmpty().withMessage('Security key is required.')
        .isLength({ min: 8 }).withMessage('Security key must be at least 8 units long.')
        .matches(/\d/).withMessage('Security key must contain at least one digit.')
        .matches(/[A-Z]/).withMessage('Security key must contain at least one uppercase letter.'),
    
    body('role')
        .optional()
        .isIn(['student', 'instructor']).withMessage('Invalid authorization role.')
];

export const loginSchema = [
    body('email')
        .trim()
        .notEmpty().withMessage('Credentials: Email required.')
        .isEmail().withMessage('Credentials: Valid email format protocol required.'),
    
    body('password')
        .notEmpty().withMessage('Credentials: Password required.')
];

export const otpVerifySchema = [
    body('email')
        .trim()
        .notEmpty().withMessage('Verification: Email required.')
        .isEmail().withMessage('Verification: Valid email protocol required.'),
    
    body('otp')
        .trim()
        .notEmpty().withMessage('Verification: OTP is required.')
        .isLength({ min: 6, max: 6 }).withMessage('Verification: OTP must be exactly 6 digits.')
        .isNumeric().withMessage('Verification: OTP must be numeric.')
];
