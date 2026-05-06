import Setting from "../models/Setting.js";
import { v2 as cloudinary } from 'cloudinary';
import { invalidateSettingsCache } from "../utils/settingsCache.js";
import { resetPusherInstance } from "../services/pusherService.js";
import { getLiveKitAdminSnapshot } from "../services/livekitService.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import defaultHomepageConfig from "../utils/defaultHomepageConfig.js";

// Get Site Settings (publicly visible ones)
export const getSettings = asyncHandler(async (req, res, next) => {
    const settings = await Setting.find({ isSensitive: false });
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    return responseHelper.success(res, { settings: settingsObj }, 'Site configurations synchronized');
});

export const getHomepageSettings = asyncHandler(async (req, res, next) => {
    const homepageSetting = await Setting.findOne({ key: 'homepage_config' });
    const homepage = homepageSetting?.value || defaultHomepageConfig;
    return responseHelper.success(res, { homepage }, 'Homepage configuration synchronized');
});

// Get All Settings (Admin only)
export const getAllSettings = asyncHandler(async (req, res, next) => {
    const settings = await Setting.find();
    const sanitized = settings.map((setting) => {
        const entry = setting.toObject ? setting.toObject() : setting;
        if (entry.key === 'livekit_api_secret') {
            return {
                ...entry,
                value: entry.value ? '__configured__' : ''
            };
        }
        return entry;
    });
    return responseHelper.success(res, { settings: sanitized }, 'Institutional protocol registry synchronized');
});

// Update or Create Setting (Admin only)
export const updateSetting = asyncHandler(async (req, res, next) => {
    const { key, value, isSensitive } = req.body;
    
    let setting = await Setting.findOneAndUpdate(
        { key },
        { key, value, ...(isSensitive !== undefined && { isSensitive }) },
        { upsert: true, new: true }
    );
    
    invalidateSettingsCache();

    if (key.startsWith('pusher_')) {
        resetPusherInstance();
    }
    
    return responseHelper.success(res, { setting }, `Institutional configuration ${key} synchronized`);
});

// Update or Create Multiple Settings (Admin only)
export const updateBatchSettings = asyncHandler(async (req, res, next) => {
    const { settings, isSensitive } = req.body; // settings: { key: value, key2: value2 }
    
    const bulkOperations = Object.entries(settings).map(([key, value]) => ({
        updateOne: {
            filter: { key },
            update: { 
                $set: { 
                    value,
                    ...(isSensitive !== undefined && { isSensitive })
                } 
            },
            upsert: true
        }
    }));

    if (bulkOperations.length > 0) {
        await Setting.bulkWrite(bulkOperations);
        invalidateSettingsCache();

        const hasPusherSettings = Object.keys(settings).some(k => k.startsWith('pusher_'));
        if (hasPusherSettings) {
            resetPusherInstance();
        }
    }
    
    return responseHelper.success(res, {}, 'Institutional configuration protocols batch-synchronized');
});

export const getLiveKitAdminSettings = asyncHandler(async (req, res, next) => {
    const snapshot = await getLiveKitAdminSnapshot();
    return responseHelper.success(res, snapshot, 'LiveKit administration settings synchronized');
});

export const updateLiveKitAdminSettings = asyncHandler(async (req, res, next) => {
    const input = req.body || {};
    const url = typeof input.livekit_url === 'string' ? input.livekit_url.trim() : '';
    const apiKey = typeof input.livekit_api_key === 'string' ? input.livekit_api_key.trim() : '';
    const apiSecret = typeof input.livekit_api_secret === 'string' ? input.livekit_api_secret.trim() : '';

    const bulkOperations = [
        {
            updateOne: {
                filter: { key: 'livekit_url' },
                update: { $set: { value: url, isSensitive: true } },
                upsert: true
            }
        },
        {
            updateOne: {
                filter: { key: 'livekit_api_key' },
                update: { $set: { value: apiKey, isSensitive: true } },
                upsert: true
            }
        }
    ];

    if (apiSecret) {
        bulkOperations.push({
            updateOne: {
                filter: { key: 'livekit_api_secret' },
                update: { $set: { value: apiSecret, isSensitive: true } },
                upsert: true
            }
        });
    }

    await Setting.bulkWrite(bulkOperations);
    invalidateSettingsCache();

    const snapshot = await getLiveKitAdminSnapshot();
    return responseHelper.success(res, snapshot, 'LiveKit administration settings synchronized');
});

export const updateHomepageSettings = asyncHandler(async (req, res, next) => {
    const { homepage } = req.body;

    if (!homepage || typeof homepage !== 'object' || Array.isArray(homepage)) {
        return next(new AppError('Homepage configuration payload is invalid', 400));
    }

    const setting = await Setting.findOneAndUpdate(
        { key: 'homepage_config' },
        { key: 'homepage_config', value: homepage, isSensitive: false },
        { upsert: true, new: true }
    );

    invalidateSettingsCache();

    return responseHelper.success(res, { homepage: setting.value }, 'Homepage configuration synchronized');
});

// Upload Logo (Admin only)
export const uploadLogo = asyncHandler(async (req, res, next) => {
    const { key } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
        return next(new AppError('Institutional rebranding requires a media artifact (image)', 400));
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    const imageUrl = imageUpload.secure_url;

    let setting = await Setting.findOneAndUpdate(
        { key },
        { value: imageUrl, isSensitive: false },
        { upsert: true, new: true }
    );

    invalidateSettingsCache();

    return responseHelper.success(res, { imageUrl }, 'Institutional rebranding verified');
});
