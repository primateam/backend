import { tokenSchema } from '../../utils/auth.js';
import { logoutService } from '../../services/auth/logout.js';
import logger from '../../utils/logger.js';
import { z } from 'zod';

export const logoutController = {
  async logout(c){
    let body;
    let refreshToken;

    try {
      refreshToken = c.req.cookie('refresh_token');

      if (!refreshToken) {
        body = await c.req.json().catch(() => ({}));

        const validatedBody = tokenSchema.parse(body);
        refreshToken = validatedBody.refresh_token;
      }

      if (!refreshToken) {
        return c.json({ error: 'Refresh token is missing' }, 401);
      }

      await logoutService.logout(refreshToken);

      logger.info('User logged out successfully');

      c.cookie('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 0,
      });

      return c.json({ message: 'Logout successful' }, 200);

    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Failed to logout user');

      if (error instanceof z.ZodError) {
        const details = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          details[path] = issue.message;
        });
        return c.json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validasi input gagal',
          details: details,
        }, 400);
      }

      if (error.message.includes('Invalid token')) {
        logger.warn('Logout attempted with an invalid token, clearing cookie.');

        c.cookie('refresh_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 0,
        });

        return c.json({ message: 'Logout successful (Token was already invalid or missing)' }, 200);
      }

      return c.json({ error: 'Failed to logout user' }, 500);
    }
  }
};