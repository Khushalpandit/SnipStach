import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@snipstash/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-here'
    ) as User;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      status: 401,
    });
  }
}; 