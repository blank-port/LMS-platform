import responseHelper from "../utils/responseHelper.js";

// Centralized Professional Error Handling Protocol
const errorMiddleware = (err, req, res, next) => {
    console.error(`[GLOBAL ERROR] Caught at ${req.method} ${req.originalUrl}:`, err);
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Institutional System Error';
    let errors = err.errors || [];

    // --- Specialized Error Handling ---

    // 1. Mongoose Bad ID (CastError)
    if (err.name === 'CastError') {
        message = `Invalid protocol identifier: ${err.value}`;
        statusCode = 400;
    }

    // 2. Mongoose Duplicate Key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate field error: ${field} already exists.`;
        statusCode = 400;
    }

    // 3. Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const extractedErrors = Object.values(err.errors).map(el => ({ [el.path]: el.message }));
        message = 'Data Validation Protocol Failed';
        statusCode = 400;
        errors = extractedErrors;
    }

    // 4. JWT Errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid authentication token. Access denied.';
        statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Authentication token has expired. Please re-authenticate.';
        statusCode = 401;
    }

    // Log error for internal auditing
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[PrismEd Error]: ${message}`);
        if (err.stack) console.error(err.stack);
    }

    // Standardized Error Response via Helper
    return responseHelper.error(res, {
        message,
        errors,
        stack: process.env.NODE_ENV === 'production' ? '🛡️' : err.stack,
    }, statusCode);
};

export default errorMiddleware;
