import Razorpay from 'razorpay';
import Setting from '../models/Setting.js';

export const getRazorpayInstance = async () => {
    // Priority 1: Environment Variables (Production Managed)
    const envKeyId = process.env.RAZORPAY_KEY_ID;
    const envKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (envKeyId && envKeySecret) {
        return new Razorpay({
            key_id: envKeyId,
            key_secret: envKeySecret,
        });
    }

    // Priority 2: Database Settings (Admin UI Managed)
    const keyId = await Setting.findOne({ key: 'razorpay_key_id' });
    const keySecret = await Setting.findOne({ key: 'razorpay_key_secret' });

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured in Environment or Admin Settings');
    }

    return new Razorpay({
        key_id: keyId.value,
        key_secret: keySecret.value,
    });
};
