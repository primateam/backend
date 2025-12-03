import { createMiddleware } from 'hono/factory';
import { db } from '../db/index.js';
import { idempotency } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import logger from '../utils/logger.js';

/**
 * Middleware untuk penanganan Idempotency Key pada permintaan POST.
 * Memeriksa header 'Idempotency-Key' untuk mengembalikan respons dicache
 * jika permintaan yang sama telah berhasil diproses sebelumnya.
 * @returns {import('hono').MiddlewareHandler}
 */
export const idempotencyMiddleware = () => {
  return createMiddleware(async (c, next) => {
    if (c.req.method !== 'POST') {
      return next();
    }

    const idempotencyKey = c.req.header('Idempotency-Key');

    if (!idempotencyKey) {
      return next();
    }

    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 10) {
      logger.warn({ key: idempotencyKey, path: c.req.path }, 'Invalid Idempotency-Key format');
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Idempotency-Key not valid character min 10'
        }
      }, 400);
    }

    logger.debug({ key: idempotencyKey, path: c.req.path }, 'Mengecek cache Idempotency-Key.');

    try {
      const [cachedRecord] = await db
        .select()
        .from(idempotency)
        .where(eq(idempotency.key, idempotencyKey))
        .limit(1);

      if (cachedRecord) {
        logger.info({ key: idempotencyKey }, 'Idempotency key ditemukan dan request tidak diproses.');
        const responseBody = JSON.parse(cachedRecord.responseBody); //mengambil respons yang sudah disimpan
        return c.json(responseBody, cachedRecord.statusCode); //kirimkan langsung statusnya
      }
    } catch (error) {
      logger.error({ err: error, key: idempotencyKey }, 'Gagal membaca cache Idempotency dari database');
    }

    await next();

    const statusCode = c.get('idempotencyResponseStatusCode');
    const responseData = c.get('idempotencyResponseData');

    if (responseData && (statusCode === 201 || statusCode === 200)) {
      try {
        await db
          .insert(idempotency)
          .values({
            key: idempotencyKey,
            responseBody: JSON.stringify(responseData),
            statusCode: statusCode,
          })
          .onConflictDoNothing()
          .execute();

        logger.info({ key: idempotencyKey, statusCode: statusCode }, 'Respons berhasil di-cache untuk Idempotency Key.');

      } catch (error) {
        logger.error({ err: error, key: idempotencyKey }, 'Gagal menyimpan cache Idempotency ke database');
      }
    }
  });
};