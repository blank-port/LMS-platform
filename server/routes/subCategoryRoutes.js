import express from 'express';
import { adminAuth } from '../middlewares/authMiddleware.js';
import { 
    createSubCategory, 
    getSubCategoriesByCategoryId, 
    getAllSubCategories, 
    deleteSubCategory 
} from '../controllers/subCategoryController.js';

const subCategoryRouter = express.Router();

subCategoryRouter.post('/add', adminAuth, createSubCategory);
subCategoryRouter.get('/all', adminAuth, getAllSubCategories);
subCategoryRouter.get('/:categoryId', adminAuth, getSubCategoriesByCategoryId);
subCategoryRouter.delete('/:id', adminAuth, deleteSubCategory);

export default subCategoryRouter;
