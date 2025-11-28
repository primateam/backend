import { loginSchema } from '../../utils/auth.js';
import { loginService } from '../../services/auth/login.js';
import logger from '../../utils/logger.js';
import { z } from 'zod';
import { UnauthorizedError } from '../../errors/index.js';
import { sendSuccess } from '../../utils/response.js';

export const loginController = {
  async login(c) {
    let body;

    try {
      body = await c.req.json();

      const parseResult = loginSchema.parse(body);
      const { username, password } = parseResult;

      const loginResult = await loginService.loginUser(
        username,
        password,
      );

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: tokenType,
        expires_in: expiresIn,
        user
      } = loginResult;

      logger.info({ userId: user.userId, username: user.username }, 'User logged in successfully');

      c.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(c, {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: tokenType,
        expires_in: expiresIn,
      }, 200);

    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Failed to login user');

      if (error instanceof z.ZodError) {
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

      if (error instanceof UnauthorizedError) {
        return c.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Username atau Password salah',
          }
        }, 401);
      }

      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to login user',
        }
      }, 500);
    }
  }
};