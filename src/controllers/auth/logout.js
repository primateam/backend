import { logoutService } from '../../services/auth/logOut';
import logger from '../../utils/logger.js';

export const logoutController = {
  async logout(c){
    try {
      const body = await c.reg.json();
      const { refreshToken } = body.refresh_token;

      if (!refreshToken) {
        return c.json({ error: 'Refresh token dibutuhkan' }, 400);
      }

      await logoutService.logout(refreshToken);

      return c.text(null, 204);
    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Gagal melakukan logout');
      return c.json({ error: 'Gagal melakukan logout' }, 500);
    }
  }
};