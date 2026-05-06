import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import { grantPoints } from '../services/gamificationService.js';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all blogs (admin)
export const getAllBlogs = asyncHandler(async (req, res, next) => {
    const blogs = await Blog.find()
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { blogs }, 'Institutional blog registry synchronized');
});

// Get user's blogs (educator/author)
export const getMyBlogs = asyncHandler(async (req, res, next) => {
    const blogs = await Blog.find({ author: req.user._id })
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { blogs }, 'Personal blog registry synchronized');
});

// Get published blogs (public)
export const getPublishedBlogs = asyncHandler(async (req, res, next) => {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;
    
    const blogs = await Blog.find(query)
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    const total = await Blog.countDocuments(query);
    const meta = {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
    
    return responseHelper.success(res, { blogs }, 'Community contribution articles synchronized', 200, meta);
});

// Get blog by slug (public)
export const getBlogBySlug = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findOneAndUpdate(
        { slug: req.params.slug, status: 'published' },
        { $inc: { views: 1 } },
        { new: true }
    ).populate('author', 'name avatar');
    
    if (!blog) return next(new AppError('Institutional article not found in registry', 404));

    // Institutional Commentary Retrieval
    const comments = await Comment.find({ 
        targetId: blog._id, 
        targetType: 'Blog',
        status: 'approved'
    }).populate('user', 'name avatar').sort({ createdAt: -1 });

    return responseHelper.success(res, { blog: { ...blog._doc, comments } }, 'Article content synchronized');
});

// Create blog
export const createBlog = asyncHandler(async (req, res, next) => {
    const { title, slug, content, excerpt, category, tags, featuredImage, status, allowComments } = req.body;
    
    const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Blog.findOne({ slug: autoSlug });
    if (existing) return next(new AppError('Strategic artifact already exists with this slug', 400));
    
    const blog = await Blog.create({
        title, slug: autoSlug, content, excerpt,
        author: req.user._id,
        category, tags, featuredImage, status, allowComments
    });
    
    // Grant points for community contribution
    await grantPoints(req.user._id, 'blog_create');
    
    return responseHelper.success(res, { blog }, 'Community contribution article provisioned successfully', 201);
});

// Update blog
export const updateBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return next(new AppError('Institutional article not found', 404));
    return responseHelper.success(res, { blog }, 'Community contribution article synchronized');
});

// Delete blog
export const deleteBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return next(new AppError('Institutional article artifact not found', 404));
    return responseHelper.success(res, {}, 'Community contribution article decommissioned');
});

// Get blog categories
export const getBlogCategories = asyncHandler(async (req, res, next) => {
    const categories = await Blog.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    return responseHelper.success(res, { categories }, 'Article taxonomy synchronized');
});
