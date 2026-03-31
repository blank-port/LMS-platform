import express from 'express';
import { 
    depositToWallet, 
    getWalletDetails, 
    requestWithdrawal, 
    getPendingWithdrawals, 
    processWithdrawal 
} from '../controllers/walletController.js';
import { studentAuth, adminAuth, instructorAuth } from '../middlewares/authMiddleware.js';

const walletRouter = express.Router();

// Student Routes
walletRouter.post('/deposit', studentAuth, depositToWallet);
walletRouter.get('/details', studentAuth, getWalletDetails);

// Instructor Routes
walletRouter.post('/withdraw-request', instructorAuth, requestWithdrawal);
walletRouter.get('/history', instructorAuth, getWalletDetails); // Shared logic

// Admin Routes
walletRouter.get('/pending-withdrawals', adminAuth, getPendingWithdrawals);
walletRouter.post('/process-withdrawal', adminAuth, processWithdrawal);

export default walletRouter;
