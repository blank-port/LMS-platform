import CmsPage from '../models/CmsPage.js';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all CMS pages
export const getAllPages = asyncHandler(async (req, res, next) => {
    const pages = await CmsPage.find().sort({ sortOrder: 1, createdAt: -1 });
    return responseHelper.success(res, { pages }, 'CMS page registry synchronized');
});

// Get page by slug (public)
export const getPageBySlug = asyncHandler(async (req, res, next) => {
    const page = await CmsPage.findOne({ slug: req.params.slug, status: 'published' });
    if (!page) return next(new AppError('Institutional page not found in registry', 404));
    return responseHelper.success(res, { page }, 'Page content synchronized');
});

// Create page
export const createPage = asyncHandler(async (req, res, next) => {
    const { title, slug, content, metaTitle, metaDescription, metaKeywords, featuredImage, status, sortOrder, pageType, sectionData } = req.body;
    
    const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await CmsPage.findOne({ slug: autoSlug });
    if (existing) return next(new AppError('Strategic artifact already exists with this slug', 400));
    
    const page = await CmsPage.create({
        title, slug: autoSlug, content, metaTitle, metaDescription,
        metaKeywords, featuredImage, status, sortOrder, pageType, sectionData
    });
    
    return responseHelper.success(res, { page }, 'CMS page provisioned successfully', 201);
});

// Update page
export const updatePage = asyncHandler(async (req, res, next) => {
    const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return next(new AppError('Institutional page not found', 404));
    return responseHelper.success(res, { page }, 'CMS page synchronized');
});

// Delete page
export const deletePage = asyncHandler(async (req, res, next) => {
    const page = await CmsPage.findByIdAndDelete(req.params.id);
    if (!page) return next(new AppError('Institutional page artifact not found', 404));
    return responseHelper.success(res, {}, 'CMS page artifact decommissioned');
});
