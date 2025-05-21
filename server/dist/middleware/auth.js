import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Unauthorized',
                code: 'UNAUTHORIZED',
                status: 401,
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
            code: 'INVALID_TOKEN',
            status: 401,
        });
    }
};
