import { refreshService } from '../../services/auth/refresh.js';
import logger from '../../utils/logger.js';

export const refreshController = {
  async refresh(c) {
    try {
      const body = await c.req.json();
      const refreshToken = body.refresh_token;

      if (!refreshToken) {
        return c.json({ error: 'Refresh token dibutuhkan' }, 400);
      }

      const newTokens = await refreshService.refreshToken(refreshToken);

      return c.json(newTokens, 200);
    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Gagal melakukan refresh token');

      if (error.message === 'Refresh token tidak valid' || error.message === 'Refresh token telah kedaluwarsa') {
        return c.json({ error: error.message }, 400);
      }

      return c.json({ error: 'Gagal melakukan refresh token' }, 500);
    }
  }
};