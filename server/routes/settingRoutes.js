import express from 'express';
import { getSettings, getAllSettings, updateSetting, updateBatchSettings, uploadLogo } from '../controllers/settingController.js';
import { adminAuth } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const settingRouter = express.Router();

settingRouter.get('/public', getSettings);
settingRouter.get('/all', adminAuth, getAllSettings);
settingRouter.post('/update', adminAuth, updateSetting);
settingRouter.post('/update-batch', adminAuth, updateBatchSettings);
settingRouter.post('/upload-logo', adminAuth, upload.single('logo'), uploadLogo);

export default settingRouter;
