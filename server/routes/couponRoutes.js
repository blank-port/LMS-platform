import express from 'express';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { adminAuth, authMiddleware } from '../middlewares/authMiddleware.js';

const couponRouter = express.Router();

// Institutional Administration (Coupons)
couponRouter.get('/', adminAuth, getAllCoupons);
couponRouter.post('/', adminAuth, createCoupon);
couponRouter.put('/:id', adminAuth, updateCoupon);
couponRouter.delete('/:id', adminAuth, deleteCoupon);

// Strategic Validation (Scholar Checkout)
couponRouter.post('/validate', authMiddleware, validateCoupon);

export default couponRouter;
