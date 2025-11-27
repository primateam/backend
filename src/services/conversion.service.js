import { db } from '../db/index.js';
import { conversion } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

const CONVERSION_FIELDS = [
  'customerId',
  'productId',
  'conversionDate',
  'status',
];

const sanitizeConversionPayload = (payload) => {
  const sanitized = {};
  for (const field of CONVERSION_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      sanitized[field] = payload[field];
    }
  }
  return sanitized;
};

class ConversionService {
  async getConversions({ limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(conversion);

      const conversions = await db
        .select()
        .from(conversion)
        .limit(limit)
        .offset(offset);

      return {
        data: conversions,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch conversions');
      throw new Error('Failed to fetch conversions');
    }
  }

  async getConversionById(conversionId) {
    try {
      const [record] = await db
        .select()
        .from(conversion)
        .where(eq(conversion.conversionId, conversionId))
        .limit(1);

      return record || null;
    } catch (error) {
      logger.error({ err: error, conversionId }, 'Failed to fetch the conversion');
      throw new Error('Failed to fetch the conversion');
    }
  }

  async createConversion(payload) {
    try {
      const sanitized = sanitizeConversionPayload(payload);
      const [created] = await db
        .insert(conversion)
        .values(sanitized)
        .returning({
          conversionId: conversion.conversionId,
          ...conversion,
        });

      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeConversionPayload(payload) }, 'Failed to create conversion');
      throw new Error('Failed to create conversion');
    }
  }

  async updateConversion(conversionId, updates) {
    try {
      const sanitized = sanitizeConversionPayload(updates);
      const [updated] = await db
        .update(conversion)
        .set(sanitized)
        .where(eq(conversion.conversionId, conversionId))
        .returning({
          conversionId: conversion.conversionId,
          ...conversion,
        });

      if (updated) {
        logger.info({ conversionId }, 'Conversion updated successfully');
      }

      return updated || null;
    } catch (error) {
      logger.error({ err: error, conversionId }, 'Failed to update conversion');
      throw new Error('Failed to update conversion');
    }
  }

  async deleteConversion(conversionId) {
    try {
      const result = await db
        .delete(conversion)
        .where(eq(conversion.conversionId, conversionId))
        .returning({ conversionId: conversion.conversionId });

      if (result.length > 0) {
        logger.info({ conversionId }, 'Conversion deleted successfully');
      }

      return result.length > 0;
    } catch (error) {
      logger.error({ err: error, conversionId }, 'Failed to delete conversion');
      throw new Error('Failed to delete conversion');
    }
  }

  async getConversionsByCustomer(customerId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(conversion)
        .where(eq(conversion.customerId, customerId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error({ err: error, customerId, limit, offset }, 'Failed to fetch customer conversions');
      throw new Error('Failed to fetch customer conversions');
    }
  }

  async getConversionsByProduct(productId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(conversion)
        .where(eq(conversion.productId, productId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error({ err: error, productId, limit, offset }, 'Failed to fetch product conversions');
      throw new Error('Failed to fetch product conversions');
    }
  }
}

export const conversionService = new ConversionService();

