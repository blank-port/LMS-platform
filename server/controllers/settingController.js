import Setting from "../models/Setting.js";
import { v2 as cloudinary } from 'cloudinary';

// Get Site Settings (publicly visible ones)
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find({ isSensitive: false });
        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.json({ success: true, settings: settingsObj });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Settings (Admin only)
export const getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.find();
        res.json({ success: true, settings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update or Create Setting (Admin only)
export const updateSetting = async (req, res) => {
    try {
        const { key, value, isSensitive } = req.body;
        
        let setting = await Setting.findOne({ key });
        if (setting) {
            setting.value = value;
            if (isSensitive !== undefined) setting.isSensitive = isSensitive;
            await setting.save();
        } else {
            await Setting.create({ key, value, isSensitive });
        }
        
        res.json({ success: true, message: `Setting ${key} updated` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update or Create Multiple Settings (Admin only)
export const updateBatchSettings = async (req, res) => {
    try {
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
        }
        
        res.json({ success: true, message: "Batch settings updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Upload Logo (Admin only)
export const uploadLogo = async (req, res) => {
    try {
        const { key } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        const imageUrl = imageUpload.secure_url;

        let setting = await Setting.findOne({ key });
        if (setting) {
            setting.value = imageUrl;
            await setting.save();
        } else {
            await Setting.create({ key, value: imageUrl, isSensitive: false });
        }

        res.json({ success: true, message: "Logo updated successfully", imageUrl });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
