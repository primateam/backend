import { tokenSchema } from '../../validators/auth.validator.js';
import { refreshService } from '../../services/auth/refresh.js';
import logger from '../../utils/logger.js';

export const refreshController = {
  async refresh(c) {

    let body;

    try {
      body = await c.req.json();

      const parseResult = tokenSchema.parse(body);
      const { refresh_token: refreshToken } = parseResult;

      const newTokens = await refreshService.refreshToken(refreshToken);

      return c.json(newTokens, 200);

    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Gagal melakukan refresh token');

      if (error.issues) {
        const details = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          details[path] = issue.message;
        });
        return c.json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validasi input gagal',
          details: { [error.issues[0].path.join('.')]: error.issues[0].message },
        }, 400);
      }

      if (error.message === 'Refresh token tidak valid' ||
        error.message === 'Refresh token telah kedaluwarsa' ||
        error.message === 'Refresh token tidak ditemukan') {

        return c.json({ error: error.message }, 400);
      }

      return c.json({ error: 'Gagal melakukan refresh token' }, 500);
    }
  }
};