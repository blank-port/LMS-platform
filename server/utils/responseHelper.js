const responseHelper = {
    /**
     * Standard Success Relay
     * @param {Object} res - Express Response object
     * @param {Object} data - Payload to return
     * @param {String} message - Human-readable success message
     * @param {Number} statusCode - HTTP Status code (default 200)
     * @param {Object} meta - Optional metadata (pagination, etc.)
     */
    success: (res, data = {}, message = 'Operation Accomplished', statusCode = 200, meta = null) => {
        const response = {
            success: true,
            status: statusCode,
            message,
            data
        };
        if (meta) response.meta = meta;
        return res.status(statusCode).json(response);
    },

    /**
     * Standard Error Relay
     * @param {Object} res - Express Response object
     * @param {Object|String} error - Error object or message string
     * @param {Number} statusCode - HTTP Status code (default 500)
     */
    error: (res, error = 'Internal System Exception', statusCode = 500) => {
        const message = typeof error === 'string' ? error : (error.message || 'Institutional Error');
        const errors = error.errors || [];
        
        return res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            errors: errors.length > 0 ? errors : undefined
        });
    }
};

export default responseHelper;
