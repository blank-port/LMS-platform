import express from 'express';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const couponRouter = express.Router();

// Admin routes
couponRouter.get('/', authMiddleware, authorize('admin'), getAllCoupons);
couponRouter.post('/', authMiddleware, authorize('admin'), createCoupon);
couponRouter.put('/:id', authMiddleware, authorize('admin'), updateCoupon);
couponRouter.delete('/:id', authMiddleware, authorize('admin'), deleteCoupon);

// Public validation (for checkout)
couponRouter.post('/validate', authMiddleware, validateCoupon);

export default couponRouter;
