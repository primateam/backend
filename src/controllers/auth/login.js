import { loginSchema } from '../../utils/auth.js';
import { loginService } from '../../services/auth/login.js';
import logger from '../../utils/logger.js';
import { z } from 'zod';
import { UnauthorizedError } from '../../errors/index.js';

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
        user
      } = loginResult;

      logger.info({ userId: user.userId, username: user.username }, 'User logged in successfully');

      c.cookie('refresh_token', refreshToken, {
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
      logger.error({ err: error, message: error.message }, 'Failed to login user');

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

      if (error instanceof UnauthorizedError) {

        return c.json({ error: 'Username atau Password salah' }, 401);
      }

      return c.json({ error: 'Failed to login user' }, 500);
    }
  }
};