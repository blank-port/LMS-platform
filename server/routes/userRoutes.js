import express from 'express';
import { 
    register, login, googleLogin, verifyEmail, resendOtp,
    getProfile, updateProfile, updateAccountProfile, changePassword,
    updateSecondaryDetails, deleteAccount, getUserData,
    getLoggedDevices, revokeDeviceSession, getReferralStats, 
    getPurchaseHistory, toggleWishlist, getWishlist,
    forgotPassword, resetPassword
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

import { registerSchema, loginSchema, otpVerifySchema } from '../validators/authValidator.js';
import validate from '../middlewares/validator.js';

const userRouter = express.Router();

// Auth routes
userRouter.post('/register', registerSchema, validate, register);
userRouter.post('/login', loginSchema, validate, login);
userRouter.post('/google-login', googleLogin);
userRouter.post('/verify-otp', otpVerifySchema, validate, verifyEmail);
userRouter.post('/resend-otp', resendOtp);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// Protected routes
userRouter.get('/profile', authMiddleware, getProfile);
userRouter.put('/profile', authMiddleware, upload.single('profilePicture'), updateProfile);
userRouter.put('/update-account-profile', authMiddleware, upload.single('profilePicture'), updateAccountProfile);
userRouter.put('/change-password', authMiddleware, changePassword);
userRouter.put('/update-secondary-details', authMiddleware, updateSecondaryDetails);
userRouter.post('/delete-account', authMiddleware, deleteAccount);
userRouter.get('/data', authMiddleware, getUserData);

// Student Support Modules (InfixLMS Parity)
userRouter.get('/sessions', authMiddleware, getLoggedDevices);
userRouter.delete('/sessions/:sessionId', authMiddleware, revokeDeviceSession);
userRouter.get('/referrals', authMiddleware, getReferralStats);
userRouter.get('/purchase-history', authMiddleware, getPurchaseHistory);

// Wishlist
userRouter.get('/wishlist', authMiddleware, getWishlist);
userRouter.post('/wishlist/:courseId', authMiddleware, toggleWishlist);

export default userRouter;