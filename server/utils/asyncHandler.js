/**
 * asyncHandler
 * High-performance wrapper for Express routes to eliminate try-catch boilerplate
 * and ensure all errors are passed to the global error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
