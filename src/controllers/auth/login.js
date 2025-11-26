import { loginSchema } from '../../validators/auth.validator.js';
import { loginService } from '../../services/auth/login.js';
import logger from '../../utils/logger.js';

export const loginController = {
  async login(c) {

    let body;

    try {
      body = await c.req.json();

      const parseResult = loginSchema.parse(body);
      const { username, password } = parseResult;

      const loginResult = await loginService.loginUser(username, password);

      return c.json(loginResult, 200);

    } catch (error) {
      logger.error({ err: error, username: body ? body.username : 'Tidak Diketahui' }, 'Gagal melakukan login');

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
          details: details,
        }, 400);
      }

      if (error.message === 'Pengguna tidak ditemukan' || error.message === 'Password tidak valid') {
        return c.json({ error: 'Username atau password salah' }, 401);
      }

      return c.json({ error: 'Gagal melakukan login' }, 500);
    }
  }
};