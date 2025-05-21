import { ApiError } from '@snipstash/shared';
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            message: err.message,
            code: err.code,
            status: err.status,
        });
    }
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            code: 'VALIDATION_ERROR',
            status: 400,
            details: err.message,
        });
    }
    // Handle mongoose duplicate key errors
    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(409).json({
            message: 'Duplicate Entry',
            code: 'DUPLICATE_ENTRY',
            status: 409,
        });
    }
    // Default error
    return res.status(500).json({
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
    });
};
