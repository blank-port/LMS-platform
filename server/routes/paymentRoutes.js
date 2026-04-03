import express from 'express';
import { 
    createOrder, verifyPayment, requestCOD, approveCOD, rejectCOD, getPendingCodOrders, 
    getMyPendingCodOrders, getNotifications, markAsRead, buyWithWallet 
} from '../controllers/paymentController.js';
import { adminAuth, studentAuth } from '../middlewares/authMiddleware.js';

const paymentRouter = express.Router();

// Student routes
paymentRouter.post('/create-order', studentAuth, createOrder);
paymentRouter.post('/verify-payment', studentAuth, verifyPayment);
paymentRouter.post('/request-cod', studentAuth, requestCOD);
paymentRouter.post('/buy-wallet', studentAuth, buyWithWallet);
paymentRouter.get('/my-pending-cod', studentAuth, getMyPendingCodOrders);


// Admin / Executive Routes
paymentRouter.post('/approve-cod', adminAuth, approveCOD); 
paymentRouter.post('/reject-cod', adminAuth, rejectCOD); 
paymentRouter.get('/pending-cod', adminAuth, getPendingCodOrders);

// Global Admin Notifications
paymentRouter.get('/notifications', adminAuth, getNotifications);
paymentRouter.patch('/notifications/:id/read', adminAuth, markAsRead);

export default paymentRouter;
