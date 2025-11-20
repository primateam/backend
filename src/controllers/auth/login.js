import { loginService } from '../../services/auth/login.js';
import logger from '../../utils/logger.js';

export const loginController = {
  async login(c) {
    try {
      const body = await c.reg.json();
      const { username, password } = body;

      if (!username || !password) {
        return c.json({ error: 'Username dan password wajib diisi' }, 400);
      }

      const loginResult = await loginService.loginUser(username, password);

      return c.json(loginResult, 200);

    } catch (error) {
      logger.error({ err: error, username: c.reg.json().username }, 'Gagal melakukan login');

      if (error.message === 'Pengguna tidak ditemukan' || error.message === 'Password tidak valid') {
        return c.json({ error: 'Username atau password salah' }, 401);
      }

      return c.json({ error: 'Gagal melakukan login' }, 500);
    }
  }
};