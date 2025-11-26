import { tokenSchema } from '../../validators/auth.validator.js';
import { LogoutService } from '../../services/auth/logOut.js';
import logger from '../../utils/logger.js';

export const logoutController = {
  async logout(c){

    let body;

    try {
      body = await c.req.json();

      const parseResult = tokenSchema.parse(body);
      const { refresh_token: refreshToken } = parseResult;

      await LogoutService.logout(refreshToken);

      return c.text(null, 204);

    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Gagal melakukan logout');

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

      return c.json({ error: 'Gagal melakukan logout' }, 500);
    }
  }
};