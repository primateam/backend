import { getCookie, setCookie } from 'hono/cookie';
import { tokenSchema } from '../../utils/auth.js';
import { refreshService } from '../../services/auth/refresh.js';
import logger from '../../utils/logger.js';
import { z } from 'zod';
import { AppError, UnauthorizedError } from '../../errors/index.js';
import { sendSuccess } from '../../utils/response.js';

export const refreshController = {
  async refresh(c) {
    let refreshToken;

    try {
      refreshToken = getCookie(c, 'refresh_token');

      if (!refreshToken) {
        const body = await c.req.json().catch(() => ({}));

        const validatedBody = tokenSchema.safeParse(body);
        if (validatedBody.success && validatedBody.data.refresh_token) {
          refreshToken = validatedBody.data.refresh_token;
        }
      }

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token is missing');
      }

      const refreshResult = await refreshService.refreshToken(refreshToken);

      const {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        token_type: tokenType,
        expires_in: expiresIn,
        user,
      } = refreshResult;

      logger.info({ userId: user.userId }, 'Token refreshed successfully');

      setCookie(c, 'refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      return sendSuccess(
        c,
        {
          user,
          access_token: accessToken,
          refresh_token: newRefreshToken,
          token_type: tokenType,
          expires_in: expiresIn,
        },
        200,
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          details[path] = issue.message;
        });
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validasi input gagal',
              details: details,
            },
          },
          400,
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      if (error.message && error.message.includes('token')) {
        logger.warn({ err: error }, 'Refresh token issue detected.');
        throw new UnauthorizedError(error.message);
      }

      logger.error(
        { err: error, message: error.message },
        'Failed to refresh token',
      );

      throw error;
    }
  },
};
