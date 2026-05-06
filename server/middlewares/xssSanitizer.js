import xss from 'xss';

/**
 * Global XSS Sanitization Middleware
 * Recursively scans and cleans request body, query, and params.
 */
const xssSanitizer = (req, res, next) => {
    const sanitize = (data) => {
        if (typeof data === 'string') {
            return xss(data);
        }
        if (Array.isArray(data)) {
            return data.map(v => sanitize(v));
        }
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const key in data) {
                sanitized[key] = sanitize(data[key]);
            }
            return sanitized;
        }
        return data;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
};

export default xssSanitizer;
