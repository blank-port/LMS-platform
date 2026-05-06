import express from 'express';
import {
    getSettings,
    getHomepageSettings,
    getAllSettings,
    getLiveKitAdminSettings,
    updateSetting,
    updateBatchSettings,
    updateHomepageSettings,
    updateLiveKitAdminSettings,
    uploadLogo
} from '../controllers/settingController.js';
import { adminAuth } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const settingRouter = express.Router();

settingRouter.get('/public', getSettings);
settingRouter.get('/homepage', getHomepageSettings);
settingRouter.get('/all', adminAuth, getAllSettings);
settingRouter.get('/livekit-admin', adminAuth, getLiveKitAdminSettings);
settingRouter.post('/update', adminAuth, updateSetting);
settingRouter.post('/update-batch', adminAuth, updateBatchSettings);
settingRouter.patch('/livekit-admin', adminAuth, updateLiveKitAdminSettings);
settingRouter.patch('/homepage', adminAuth, updateHomepageSettings);
settingRouter.post('/upload-logo', adminAuth, upload.single('logo'), uploadLogo);

export default settingRouter;
