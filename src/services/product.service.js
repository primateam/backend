import { db } from '../db/index.js';
import { product, conversion } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

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
  async getProducts({ limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(product);

      const products = await db
        .select()
        .from(product)
        .limit(limit)
        .offset(offset);

      return {
        data: products,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProductById(productId) {
    try {
      const [record] = await db
        .select()
        .from(product)
        .where(eq(product.productId, productId))
        .limit(1);

      return record || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch the product');
    }
  }

  async createProduct(payload) {
    try {
      const sanitized = sanitizeProductPayload(payload);
      const [created] = await db
        .insert(product)
        .values(sanitized)
        .returning({
          productId: product.productId,
          ...product,
        });

      return created;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(productId, updates) {
    try {
      const sanitized = sanitizeProductPayload(updates);
      const [updated] = await db
        .update(product)
        .set(sanitized)
        .where(eq(product.productId, productId))
        .returning({
          productId: product.productId,
          ...product,
        });

      return updated || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(productId) {
    try {
      const result = await db
        .delete(product)
        .where(eq(product.productId, productId))
        .returning({ productId: product.productId });
      return result.length > 0;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete product');
    }
  }

  async getProductConversions(productId, { limit = 10, offset = 0 } = {}) {
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

export const productService = new ProductService();

