import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

/**
 * Global Validation Middleware
 * Processes express-validator results and throws standardized AppError if validation fails.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    throw new AppError('Validation Protocols Failed', 422, extractedErrors);
};

export default validate;
