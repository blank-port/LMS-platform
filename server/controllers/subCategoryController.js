import SubCategory from "../models/SubCategory.js";

export const createSubCategory = async (req, res) => {
    try {
        const { name, categoryId, description } = req.body;
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
        const subCategories = await SubCategory.find().populate('categoryId', 'name');
        res.json({ success: true, subCategories });
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
