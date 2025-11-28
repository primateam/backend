import { db } from '../db/index.js';
import { product, conversion } from '../db/schema.js';
import { eq, sql, and, or, like } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../errors/index.js';
import { buildPaginatedResponse } from '../utils/response.js';

const PRODUCT_FIELDS = ['productName', 'description'];

const sanitizeProductPayload = (payload) => {
  const sanitized = {};
  for (const field of PRODUCT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      sanitized[field] = payload[field];
    }
  }
  return sanitized;
};

class ProductService {
  async getProducts({ limit = 10, offset = 0, searchQuery } = {}) {
    try {
      const whereConditions = [];

      if (searchQuery) {
        const searchLike = `%${searchQuery}%`;
        whereConditions.push(
          or(
            like(product.productName, searchLike),
            like(product.description, searchLike),
          )
        );
      }
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(product)
        .where(whereClause);

      const products = await db
        .select()
        .from(product)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(products, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch products');
      throw new DatabaseError('Failed to fetch products', error);
    }
  }

  async getProductById(productId) {
    try {
      const [record] = await db
        .select()
        .from(product)
        .where(eq(product.productId, productId))
        .limit(1);

      if (!record) {
        throw new NotFoundError('Product', productId);
      }

      return record;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, productId }, 'Failed to fetch the product');
      throw new DatabaseError('Failed to fetch the product', error);
    }
  }

  async createProduct(payload) {
    try {
      const sanitized = sanitizeProductPayload(payload);
      const [created] = await db
        .insert(product)
        .values(sanitized)
        .returning();

      logger.info({ productId: created.productId, productName: created.productName }, 'Product created successfully');

      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeProductPayload(payload) }, 'Failed to create product');
      throw new DatabaseError('Failed to create product', error);
    }
  }

  async updateProduct(productId, updates) {
    try {
      const sanitized = sanitizeProductPayload(updates);
      const [updated] = await db
        .update(product)
        .set(sanitized)
        .where(eq(product.productId, productId))
        .returning();

      if (!updated) {
        throw new NotFoundError('Product', productId);
      }

      logger.info({ productId }, 'Product updated successfully');

      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, productId, updates: sanitizeProductPayload(updates) }, 'Failed to update product');
      throw new DatabaseError('Failed to update product', error);
    }
  }

  async deleteProduct(productId) {
    try {
      const result = await db
        .delete(product)
        .where(eq(product.productId, productId))
        .returning({ productId: product.productId });

      if (result.length === 0) {
        throw new NotFoundError('Product', productId);
      }

      logger.info({ productId }, 'Product deleted successfully');

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, productId }, 'Failed to delete product');
      throw new DatabaseError('Failed to delete product', error);
    }
  }

  async getProductConversions(productId, { limit = 10, offset = 0 } = {}) {
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

export const productService = new ProductService();

