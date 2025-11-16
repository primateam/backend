import { db } from '../db/index.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('kunci JWT tidak didefinisikan di environment variables');
}

class LoginService {
  async loginUser(username, password) {
    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.userName, username))
      .limit(1);

    if (foundUser.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    const user = foundUser[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Password tidak valid');
    }

    const expiresIn = process.env.JWT._EXPIRES_IN;
    const accessToken = jwt.sign(
      { userId: user.userId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn },
    );

    const refreshToken = jwt.sign(
      { userId: user.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
    );

    const userResponse = { ...user };
    delete userResponse.password;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: userResponse,
    };
  } catch(error) {
    console.error('Error login user:', error);
    throw new Error(`Gagal melakukan login: ${error.message}`);
  }
}

export const loginService = new LoginService();