import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import logger from '../utils/logger.js';

if (!process.env.JWT_SECRET) {
  logger.fatal('JWT_SECRET is not defined in environment variables.');
  throw new Error('JWT secret is not configured.');
}

/**
 * Middleware untuk memverifikasi JWT dan mengamankan rute.
 * Juga dapat digunakan untuk memverifikasi peran (role-based access control).
 * * @param {Array<string>} [requiredRoles]
 * @returns {import('hono').MiddlewareHandler}
 */
export const authMiddleware = (requiredRoles = []) => {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn({ path: c.req.path }, 'Authentication failed: Missing or invalid Authorization header');
      throw new UnauthorizedError('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);


      c.set('user', {
        userId: payload.userId,
        role: payload.role,
        teamId: payload.teamId,
      });


      if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
        logger.warn({ userId: payload.userId, role: payload.role, required: requiredRoles }, 'Authorization failed: Forbidden access');
        throw new ForbiddenError('You do not have permission to access this resource');
      }

      await next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn({ path: c.req.path }, 'Authentication failed: Token expired');
        throw new UnauthorizedError('Access token has expired');
      }
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error;
      }

      logger.error({ err: error, token }, 'Authentication failed: JWT verification error');
      throw new UnauthorizedError('Access token is invalid');
    }
  });
};