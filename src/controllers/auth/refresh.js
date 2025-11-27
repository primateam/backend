import { tokenSchema } from '../../utils/auth.js';
import { refreshService } from '../../services/auth/refresh.js';
import logger from '../../utils/logger.js';
import { z } from 'zod';

export const refreshController = {
  async refresh(c) {
    let refreshToken;

    try {
      refreshToken = c.req.cookie('refresh_token');

      if (!refreshToken) {
        const body = await c.req.json().catch(() => ({}));

        const validatedBody = tokenSchema.safeParse(body);
        if (validatedBody.success && validatedBody.data.refresh_token) {
          refreshToken = validatedBody.data.refresh_token;
        }
      }

      if (!refreshToken) {
        return c.json({ error: 'Refresh token is missing' }, 401);
      }

      const refreshResult = await refreshService.refreshToken(refreshToken);

      const {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        user,
      } = refreshResult;

      logger.info({ userId: user.userId, username: user.username }, 'Token refreshed successfully');

      c.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return c.json({
        user,
        accessToken,
      }, 200);

    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Failed to refresh token');

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

      if (error.message.includes('Refresh token tidak valid') ||
          error.message.includes('Refresh token telah kadaluarsa') ||
          error.message.includes('Refresh token tidak ditemukan') ||
          error.message.includes('Pengguna tidak ditemukan'))
      {
        return c.json({ error: 'Refresh token invalid atau sudah kadaluarsa' }, 401);
      }

      return c.json({ error: 'Failed to refresh token' }, 500);
    }
  }
};