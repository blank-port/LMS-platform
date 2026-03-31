import express from 'express';
import { getAllPages, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/cmsController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const cmsRouter = express.Router();

// Public routes
cmsRouter.get('/page/:slug', getPageBySlug);

// Admin routes
cmsRouter.get('/', authMiddleware, authorize('admin'), getAllPages);
cmsRouter.post('/', authMiddleware, authorize('admin'), createPage);
cmsRouter.put('/:id', authMiddleware, authorize('admin'), updatePage);
cmsRouter.delete('/:id', authMiddleware, authorize('admin'), deletePage);

export default cmsRouter;
