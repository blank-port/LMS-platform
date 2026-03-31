import Blog from '../models/Blog.js';

// Get all blogs (admin)
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get published blogs (public)
export const getPublishedBlogs = async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const query = { status: 'published' };
        if (category) query.category = category;
        
        const blogs = await Blog.find(query)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
            
        const total = await Blog.countDocuments(query);
        res.json({ success: true, blogs, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get blog by slug (public)
export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug, status: 'published' },
            { $inc: { views: 1 } },
            { new: true }
        ).populate('author', 'name avatar')
         .populate('comments.user', 'name avatar');
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create blog
export const createBlog = async (req, res) => {
    try {
        const { title, slug, content, excerpt, category, tags, featuredImage, status, allowComments } = req.body;
        
        const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existing = await Blog.findOne({ slug: autoSlug });
        if (existing) return res.status(400).json({ success: false, message: 'Blog with this slug already exists' });
        
        const blog = await Blog.create({
            title, slug: autoSlug, content, excerpt,
            author: req.user._id,
            category, tags, featuredImage, status, allowComments
        });
        
        res.status(201).json({ success: true, message: 'Blog post created', blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update blog
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, message: 'Blog updated', blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete blog
export const deleteBlog = async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
    try {
        const categories = await Blog.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
