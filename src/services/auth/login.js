import { logger } from '../../utils/logger.js';
import { user, auth } from '../../db/schema.js';
import { db } from '../../db/index.js';
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
      .where(eq(user.username, username))
      .limit(1);

    if (foundUser.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    const dataUser = foundUser[0];

    const isPasswordValid = await bcrypt.compare(password, dataUser.password);

    if (!isPasswordValid) {
      throw new Error('Password tidak valid');
    }

    const expiresIn = process.env.JWT._EXPIRES_IN || '1h';
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(
      {
        userId: dataUser.userId,
        role: dataUser.role,
        teamId: dataUser.teamId
      },
      process.env.JWT_SECRET,
      { expiresIn },
    );

    const refreshToken = jwt.sign(
      { userId: dataUser.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: refreshExpiresIn },
    );

    await db.insert(auth).values({
      token: refreshToken,
      userId: dataUser.userId,
    });

    const userResponse = { ...dataUser };
    delete userResponse.password;

    logger.info({ userId: dataUser.userId }, 'User Berhasil Login');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: userResponse,
    };

  }
}

export const loginService = new LoginService();