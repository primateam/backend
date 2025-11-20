import { db } from '../../db/index.js';
import { auth } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import logger from '../../utils/logger.js';

class Logoutservice {
  async logout(refreshToken) {
    try {
      const deleteCount = await db
        .delete(auth)
        .where(eq(auth.token, refreshToken))
        .returning({ token: auth.token });

      if (deleteCount.length > 0) {
        logger.info('Refresh token berhasil dihapus');
      }

      return deleteCount.length > 0;
    } catch (error) {
      logger.error({ err: error, refreshToken }, 'Gagal menghapus refresh token');
      throw new Error(`Gagal melakukan logout: ${error.message}`);
    }
  }
}

export const logoutService = new Logoutservice();