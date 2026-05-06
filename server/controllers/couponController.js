import Coupon from '../models/Coupon.js';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all coupons
export const getAllCoupons = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find()
        .populate('applicableCourses', 'courseTitle')
        .populate('assignedUser', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
        
    const total = await Coupon.countDocuments();
    const meta = {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { coupons }, 'Fiscal incentive registry synchronized', 200, meta);
});

// Create coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
    const { code, couponType, discountType, discountValue, minPurchase, maxUses, maxUsesPerUser, validFrom, validTo, applicableCourses, assignedUser, status } = req.body;
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return next(new AppError('Strategic identity collision: Coupon code already exists', 400));

    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        couponType, discountType, discountValue, minPurchase,
        maxUses, maxUsesPerUser, validFrom, validTo,
        applicableCourses: applicableCourses || [],
        assignedUser, status
    });

    return responseHelper.success(res, { coupon }, 'Fiscal incentive provisioned successfully', 201);
});

// Update coupon
export const updateCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return next(new AppError('Fiscal incentive artifact not found', 404));
    return responseHelper.success(res, { coupon }, 'Fiscal incentive artifact synchronized');
});

// Delete coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new AppError('Fiscal incentive artifact not found', 404));
    return responseHelper.success(res, {}, 'Fiscal incentive artifact decommissioned');
});

// Validate coupon (for checkout)
export const validateCoupon = asyncHandler(async (req, res, next) => {
    const { code, courseId, userId } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });
    
    if (!coupon) return next(new AppError('Invalid or de-provisioned coupon code', 404));
    if (new Date() > new Date(coupon.validTo)) return next(new AppError('Fiscal incentive has expired', 400));
    if (new Date() < new Date(coupon.validFrom)) return next(new AppError('Fiscal incentive is not yet active', 400));
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return next(new AppError('Strategic usage limit reached', 400));
    
    // Check per-user limit
    const userUseCount = (coupon.usedBy || []).filter(u => u.user && u.user.toString() === userId).length;
    if (userUseCount >= coupon.maxUsesPerUser) return next(new AppError('Scholarly usage quota exceeded for this incentive', 400));
    
    // Check course applicability
    if (coupon.applicableCourses && coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
        return next(new AppError('Fiscal incentive not applicable to this curriculum unit', 400));
    }
    
    // Check personalized coupon
    if (coupon.couponType === 'personalized' && coupon.assignedUser && coupon.assignedUser.toString() !== userId) {
        return next(new AppError('Strategic authorization violation: Incentive not assigned to this identity', 403));
    }

    const data = { 
        code: coupon.code, 
        discountType: coupon.discountType, 
        discountValue: coupon.discountValue 
    };

    return responseHelper.success(res, { coupon: data }, 'Fiscal incentive validated and synchronized');
});
