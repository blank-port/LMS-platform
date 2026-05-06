import Referral from "../models/Referral.js";
import responseHelper from "../utils/responseHelper.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get All Referral Records (Strategic Growth Oversight)
 */
export const getReferrals = asyncHandler(async (req, res, next) => {
    const referrals = await Referral.find()
        .populate('referrer', 'name email avatar')
        .populate('referee', 'name email avatar')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { referrals }, 'Growth matrix synchronized');
});
