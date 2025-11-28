import { db } from '../db/index.js';
import { conversion } from '../db/schema.js';
import { eq, sql, and } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../errors/index.js';
import { buildPaginatedResponse } from '../utils/response.js';

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
  async getConversions({ limit = 10, offset = 0, filters } = {}) {
    try {
      const whereConditions = [];

      if (filters.customerId) {
        whereConditions.push(eq(conversion.customerId, parseInt(filters.customerId, 10)));
      }
      if (filters.productId) {
        whereConditions.push(eq(conversion.productId, parseInt(filters.productId, 10)));
      }
      if (filters.status) {
        whereConditions.push(eq(conversion.status, filters.status));
      }
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(conversion)
        .where(whereClause);

      const conversions = await db
        .select()
        .from(conversion)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(conversions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch conversions');
      throw new DatabaseError('Failed to fetch conversions', error);
    }
  }

  async getConversionById(conversionId) {
    try {
      const [record] = await db
        .select()
        .from(conversion)
        .where(eq(conversion.conversionId, conversionId))
        .limit(1);

      if (!record) {
        throw new NotFoundError('Conversion', conversionId);
      }

      return record;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, conversionId }, 'Failed to fetch the conversion');
      throw new DatabaseError('Failed to fetch the conversion', error);
    }
  }

  async createConversion(payload) {
    try {
      const sanitized = sanitizeConversionPayload(payload);
      const [created] = await db
        .insert(conversion)
        .values(sanitized)
        .returning();

      logger.info({ conversionId: created.conversionId, customerId: created.customerId, productId: created.productId }, 'Conversion created successfully');

      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeConversionPayload(payload) }, 'Failed to create conversion');
      throw new DatabaseError('Failed to create conversion', error);
    }
  }

  async updateConversion(conversionId, updates) {
    try {
      const sanitized = sanitizeConversionPayload(updates);
      const [updated] = await db
        .update(conversion)
        .set(sanitized)
        .where(eq(conversion.conversionId, conversionId))
        .returning();

      if (!updated) {
        throw new NotFoundError('Conversion', conversionId);
      }

      logger.info({ conversionId }, 'Conversion updated successfully');
      return updated || null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, conversionId }, 'Failed to update conversion');
      throw new DatabaseError('Failed to update conversion', error);
    }
  }

  async deleteConversion(conversionId) {
    try {
      const result = await db
        .delete(conversion)
        .where(eq(conversion.conversionId, conversionId))
        .returning({ conversionId: conversion.conversionId });

      if (result.length === 0) {
        throw new NotFoundError('Conversion', conversionId);
      }

      logger.info({ conversionId }, 'Conversion deleted successfully');
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, conversionId }, 'Failed to delete conversion');
      throw new DatabaseError('Failed to delete conversion', error);
    }
  }

  async getConversionsByCustomer(customerId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(conversion)
        .where(eq(conversion.customerId, customerId));

      const conversions = await db
        .select()
        .from(conversion)
        .where(eq(conversion.customerId, customerId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(conversions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, customerId, limit, offset }, 'Failed to fetch customer conversions');
      throw new DatabaseError('Failed to fetch customer conversions', error);
    }
  }

  async getConversionsByProduct(productId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(conversion)
        .where(eq(conversion.productId, productId));

      const conversions = await db
        .select()
        .from(conversion)
        .where(eq(conversion.productId, productId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(conversions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, productId, limit, offset }, 'Failed to fetch product conversions');
      throw new DatabaseError('Failed to fetch product conversions', error);
    }
  }
}

export const conversionService = new ConversionService();

