import { registerService } from '../../services/auth/register.js';
import { registerSchema } from '../../utils/auth.js';
import logger from '../../utils/logger.js';
import { sendSuccess } from '../../utils/response.js';

export const registerController = {
  async register(c) {
    let body;

    try {
      body = await c.req.json();

      const validatedBody = registerSchema.parse(body);

      const newUser = await registerService.registerUser(validatedBody);

      logger.info({
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }, 'User registered successfully');

      return sendSuccess(c, newUser, 201);
    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Failed to register user');

      if (error.issues) {
        const details = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          details[path] = issue.message;
        });
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validasi input gagal',
            details: details,
          }
        }, 400);
      }

      if (error.message.includes('already exists')) {
        return c.json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: error.message,
          }
        }, 409);
      }

      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to register user',
        }
      }, 500);
    }
  }
};