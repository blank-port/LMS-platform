import SubCategory from "../models/SubCategory.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createSubCategory = asyncHandler(async (req, res, next) => {
    const { name, categoryId, description } = req.body;
    
    const existing = await SubCategory.findOne({ name, categoryId });
    if (existing) return next(new AppError('Strategic identity collision: Sub-Category already exists in this curriculum node', 400));

    const subCategory = await SubCategory.create({ name, categoryId, description });
    return responseHelper.success(res, { subCategory }, 'Institutional sub-category initialized', 201);
});

export const getSubCategoriesByCategoryId = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    const subCategories = await SubCategory.find({ categoryId });
    return responseHelper.success(res, { subCategories }, 'Institutional sub-category registry synchronized');
});

export const getAllSubCategories = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const subCategories = await SubCategory.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
        
    const total = await SubCategory.countDocuments();
    const meta = {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { subCategories }, 'Global sub-category registry synchronized', 200, meta);
});

export const deleteSubCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findByIdAndDelete(id);
    if (!subCategory) return next(new AppError('Institutional sub-category node not found', 404));
    return responseHelper.success(res, {}, 'Institutional sub-category decommissioned');
});
