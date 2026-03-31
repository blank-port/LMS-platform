import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    couponType: { type: String, enum: ['common', 'single', 'personalized'], default: 'common' },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxUses: { type: Number, default: null },
    maxUsesPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    applicableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For personalized coupons
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
    usedBy: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
