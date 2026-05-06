import express from 'express';
import { createNotice, getNotices, deleteNotice } from '../controllers/noticeController.js';
import { authMiddleware, instructorAuth } from '../middlewares/authMiddleware.js';

const noticeRouter = express.Router();

noticeRouter.get('/fetch', getNotices);
noticeRouter.post('/create', instructorAuth, createNotice);
noticeRouter.delete('/:id', instructorAuth, deleteNotice);

export default noticeRouter;
