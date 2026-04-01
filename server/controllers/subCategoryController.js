import SubCategory from "../models/SubCategory.js";

export const createSubCategory = async (req, res) => {
    try {
        const { name, categoryId, description } = req.body;
        
        // High-Concurrency Governance: Collision Detection
        const existing = await SubCategory.findOne({ name, categoryId });
        if (existing) return res.status(400).json({ success: false, message: 'Sub-Category already exists in this curriculum node.' });

        const subCategory = await SubCategory.create({ name, categoryId, description });
        res.json({ success: true, message: 'Sub-Category initialized.', subCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSubCategoriesByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ categoryId });
        res.json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllSubCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const subCategories = await SubCategory.find()
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
            
        const total = await SubCategory.countDocuments();
        res.json({ success: true, subCategories, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await SubCategory.findByIdAndDelete(id);
        res.json({ success: true, message: 'Sub-Category decommissioned.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
