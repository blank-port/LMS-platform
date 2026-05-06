import express from 'express';
import { getAllBlogs, getMyBlogs, getPublishedBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, getBlogCategories } from '../controllers/blogController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const blogRouter = express.Router();

// Authenticated routes
blogRouter.get('/my-blogs', authMiddleware, getMyBlogs);

// Public routes
blogRouter.get('/published', getPublishedBlogs);
blogRouter.get('/categories', getBlogCategories);
blogRouter.get('/:slug', getBlogBySlug);

// Admin routes
blogRouter.get('/', authMiddleware, authorize('admin'), (req, res, next) => {
    console.log('[Blog Router] GET / - Admin access');
    getAllBlogs(req, res, next);
});

blogRouter.post('/', authMiddleware, authorize('admin', 'instructor'), (req, res, next) => {
    console.log('[Blog Router] POST / - Creative Nexus Pulse');
    createBlog(req, res, next);
});

// Fallback for legacy /create pattern
blogRouter.post('/create', authMiddleware, authorize('admin', 'instructor'), createBlog);

blogRouter.put('/:id', authMiddleware, authorize('admin', 'instructor'), updateBlog);
blogRouter.delete('/:id', authMiddleware, authorize('admin', 'instructor'), deleteBlog);

export default blogRouter;
