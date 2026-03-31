import express from 'express';
import { createOrder, verifyPayment, requestCOD, approveCOD, getPendingPayments, buyWithWallet } from '../controllers/paymentController.js';
import { adminAuth, studentAuth } from '../middlewares/authMiddleware.js';

const paymentRouter = express.Router();

// Student routes
paymentRouter.post('/create-order', studentAuth, createOrder);
paymentRouter.post('/verify-payment', studentAuth, verifyPayment);
paymentRouter.post('/request-cod', studentAuth, requestCOD);
paymentRouter.post('/buy-wallet', studentAuth, buyWithWallet);


// Admin / Instructor routes
paymentRouter.post('/approve-cod', adminAuth, approveCOD); 
paymentRouter.get('/pending', adminAuth, getPendingPayments);

export default paymentRouter;
