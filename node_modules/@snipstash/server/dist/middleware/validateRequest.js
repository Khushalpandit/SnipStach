import { validationResult } from 'express-validator';
import { ApiError } from '@snipstash/shared';
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new ApiError(errorMessages.join(', '), 'VALIDATION_ERROR', 400);
    }
    next();
};
