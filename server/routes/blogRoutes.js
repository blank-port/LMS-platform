import express from 'express';
import { getAllBlogs, getPublishedBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, getBlogCategories } from '../controllers/blogController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const blogRouter = express.Router();

// Public routes
blogRouter.get('/published', getPublishedBlogs);
blogRouter.get('/categories', getBlogCategories);
blogRouter.get('/:slug', getBlogBySlug);

// Admin routes
blogRouter.get('/', authMiddleware, authorize('admin'), getAllBlogs);
blogRouter.post('/', authMiddleware, authorize('admin'), createBlog);
blogRouter.put('/:id', authMiddleware, authorize('admin'), updateBlog);
blogRouter.delete('/:id', authMiddleware, authorize('admin'), deleteBlog);

export default blogRouter;
