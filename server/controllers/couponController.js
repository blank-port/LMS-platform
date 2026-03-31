import Coupon from '../models/Coupon.js';

// Get all coupons
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate('applicableCourses', 'courseTitle')
            .populate('assignedUser', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create coupon
export const createCoupon = async (req, res) => {
    try {
        const { code, couponType, discountType, discountValue, minPurchase, maxUses, maxUsesPerUser, validFrom, validTo, applicableCourses, assignedUser, status } = req.body;
        
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) return res.status(400).json({ success: false, message: 'Coupon code already exists' });

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            couponType, discountType, discountValue, minPurchase,
            maxUses, maxUsesPerUser, validFrom, validTo,
            applicableCourses: applicableCourses || [],
            assignedUser, status
        });

        res.status(201).json({ success: true, message: 'Coupon created', coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update coupon
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.json({ success: true, message: 'Coupon updated', coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate coupon (for checkout)
export const validateCoupon = async (req, res) => {
    try {
        const { code, courseId, userId } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });
        
        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        if (new Date() > new Date(coupon.validTo)) return res.status(400).json({ success: false, message: 'Coupon has expired' });
        if (new Date() < new Date(coupon.validFrom)) return res.status(400).json({ success: false, message: 'Coupon is not yet active' });
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        
        // Check per-user limit
        const userUseCount = coupon.usedBy.filter(u => u.user.toString() === userId).length;
        if (userUseCount >= coupon.maxUsesPerUser) return res.status(400).json({ success: false, message: 'You have already used this coupon' });
        
        // Check course applicability
        if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
            return res.status(400).json({ success: false, message: 'Coupon not applicable to this course' });
        }
        
        // Check personalized coupon
        if (coupon.couponType === 'personalized' && coupon.assignedUser.toString() !== userId) {
            return res.status(400).json({ success: false, message: 'This coupon is not assigned to you' });
        }

        res.json({ success: true, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
