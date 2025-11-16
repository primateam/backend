import { db } from '../db/index.js';
import { conversion } from '../db/schema.js';
import { eq } from 'drizzle-orm';

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
      return await db
        .select()
        .from(conversion)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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

      return updated || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update conversion');
    }
  }

  async deleteConversion(conversionId) {
    try {
      await db
        .delete(conversion)
        .where(eq(conversion.conversionId, conversionId));
      return true;
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      throw new Error('Failed to fetch product conversions');
    }
  }
}

export const conversionService = new ConversionService();

