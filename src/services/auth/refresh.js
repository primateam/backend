import { db } from '../../db/index.js';
import { user, auth } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('kunci JWT tidak didefinisikan di environment variables');
}

class RefreshService {
  /**
   * Memverifikasi refresh token, melakukan rotasi token (menghapus yang lama, membuat yang baru).
   * @param {string} refreshToken - Token lama dari request body.
   * @returns {{access_token: string, refresh_token: string, token_type: string, expires_in: string}}
   */
  async refreshToken(refreshToken) {
    let payload;

    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token telah kadaluarsa');
      }
      throw new Error('Refresh token tidak valid');
    }

    const userId = payload.userId;

    const tokenRecord = await db
      .select()
      .from(auth)
      .where(eq(auth.token, refreshToken))
      .limit(1);

    if (tokenRecord.length === 0) {
      throw new Error('Refresh token tidak ditemukan di database');
    }

    const getUser = await db
      .select()
      .from(user)
      .where(eq(user.userId, userId))
      .limit(1);

    if (getUser.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    const dataUser = getUser[0];

    await db.delete(auth).where(eq(auth.token, refreshToken));

    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    const newAccessToken = jwt.sign(
      {
        userId: dataUser.userId,
        role: dataUser.role,
        teamId: dataUser.teamId,
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: dataUser.userId,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: refreshExpiresIn }
    );

    await db.insert(auth).values({
      token: newRefreshToken,
      userId: dataUser.userId,
    });

    logger.info({ userId: dataUser.userId }, 'Token berhasil di-refresh');

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }
}

export const refreshService = new RefreshService();