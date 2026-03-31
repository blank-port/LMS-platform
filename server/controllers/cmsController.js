import CmsPage from '../models/CmsPage.js';

// Get all CMS pages
export const getAllPages = async (req, res) => {
    try {
        const pages = await CmsPage.find().sort({ sortOrder: 1, createdAt: -1 });
        res.json({ success: true, pages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get page by slug (public)
export const getPageBySlug = async (req, res) => {
    try {
        const page = await CmsPage.findOne({ slug: req.params.slug, status: 'published' });
        if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
        res.json({ success: true, page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create page
export const createPage = async (req, res) => {
    try {
        const { title, slug, content, metaTitle, metaDescription, metaKeywords, featuredImage, status, sortOrder, pageType, sectionData } = req.body;
        
        const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existing = await CmsPage.findOne({ slug: autoSlug });
        if (existing) return res.status(400).json({ success: false, message: 'Page with this slug already exists' });
        
        const page = await CmsPage.create({
            title, slug: autoSlug, content, metaTitle, metaDescription,
            metaKeywords, featuredImage, status, sortOrder, pageType, sectionData
        });
        
        res.status(201).json({ success: true, message: 'Page created', page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update page
export const updatePage = async (req, res) => {
    try {
        const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
        res.json({ success: true, message: 'Page updated', page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete page
export const deletePage = async (req, res) => {
    try {
        await CmsPage.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
