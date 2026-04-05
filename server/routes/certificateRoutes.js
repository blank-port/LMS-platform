import express from 'express';
import { manualIssue, getMyCertificates, verifyCertificate } from '../controllers/certificateController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const certificateRouter = express.Router();

// Student Routes
certificateRouter.get('/my-certificates', authMiddleware, getMyCertificates);
certificateRouter.get('/verify/:certificateId', verifyCertificate);

// Educator/Admin Routes (Manual Issue)
certificateRouter.post('/manual-issue', authMiddleware, upload.single('certificate'), manualIssue);

export default certificateRouter;
