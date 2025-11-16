import { registerService } from '../../services/auth/register';

export const registerController = {
  async register(c) {
    try {
      const body = await c.req.json();

      if (!body.fullName || !body.userName || !body.email || !body.password) {
        return c.json({ error: 'Username, password, dan email wajib diisi!' }), 400;
      }

      const newUser = await registerService.registerUser(body);

      return c.json(newUser, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Gagal melakukan registrasi pengguna.' }, 500);
    }
  }
};