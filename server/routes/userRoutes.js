import express from 'express';
import { 
    register, login, googleLogin, verifyEmail, resendOtp, getProfile, updateProfile, getUserData, 
    updateAccountProfile, changePassword, updateSecondaryDetails, deleteAccount,
    getLoggedDevices, revokeDeviceSession, getReferralStats, getPurchaseHistory,
    toggleWishlist, getWishlist
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const userRouter = express.Router();

// Auth routes
userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/google-login', googleLogin);
userRouter.post('/verify-otp', verifyEmail);
userRouter.post('/resend-otp', resendOtp);

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