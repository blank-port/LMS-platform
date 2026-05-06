import express from 'express';
import { getReferrals } from '../controllers/marketingController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const marketingRouter = express.Router();

// Admin Only Protocol
marketingRouter.use(authMiddleware, authorize('admin'));

marketingRouter.get('/referrals', getReferrals);

export default marketingRouter;
