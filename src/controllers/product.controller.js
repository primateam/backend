import { productService } from '../services/product.service.js';

export const productController = {
  async getProducts(c) {
    try {
      const limitStr = c.req.query('limit') || '10';
      const offsetStr = c.req.query('offset') || '0';

      const limit = parseInt(limitStr, 10);
      const offset = parseInt(offsetStr, 10);

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return c.json({ error: 'Invalid limit. Must be between 1 and 100' }, 400);
      }
      if (isNaN(offset) || offset < 0) {
        return c.json({ error: 'Invalid offset. Must be 0 or greater' }, 400);
      }

      const products = await productService.getProducts({ limit, offset });
      return c.json(products);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch products' }, 500);
    }
  },

  async getProductById(c) {
    try {
      const idStr = c.req.param('product_id');
      const productId = parseInt(idStr, 10);

      if (isNaN(productId) || productId < 1) {
        return c.json({ error: 'Invalid product_id' }, 400);
      }

      const found = await productService.getProductById(productId);
      if (!found) return c.json({ error: 'Product not found' }, 404);
      return c.json(found);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch product' }, 500);
    }
  },

  async createProduct(c) {
    try {
      const body = await c.req.json();

      if (!body.productName) {
        return c.json({ error: 'Product name is required' }, 400);
      }

      const created = await productService.createProduct(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create product' }, 500);
    }
  },

  async updateProduct(c) {
    try {
      const idStr = c.req.param('product_id');
      const productId = parseInt(idStr, 10);

      if (isNaN(productId) || productId < 1) {
        return c.json({ error: 'Invalid product_id' }, 400);
      }

      const body = await c.req.json();
      const updated = await productService.updateProduct(productId, body);
      if (!updated) return c.json({ error: 'Product not found' }, 404);
      return c.json(updated);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to update product' }, 500);
    }
  },

  async deleteProduct(c) {
    try {
      const idStr = c.req.param('product_id');
      const productId = parseInt(idStr, 10);

      if (isNaN(productId) || productId < 1) {
        return c.json({ error: 'Invalid product_id' }, 400);
      }

      const deleted = await productService.deleteProduct(productId);
      if (!deleted) return c.json({ error: 'Product not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete product' }, 500);
    }
  },

  async getProductConversions(c) {
    try {
      const idStr = c.req.param('product_id');
      const productId = parseInt(idStr, 10);

      if (isNaN(productId) || productId < 1) {
        return c.json({ error: 'Invalid product_id' }, 400);
      }

      const limitStr = c.req.query('limit') || '10';
      const offsetStr = c.req.query('offset') || '0';

      const limit = parseInt(limitStr, 10);
      const offset = parseInt(offsetStr, 10);

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return c.json({ error: 'Invalid limit. Must be between 1 and 100' }, 400);
      }
      if (isNaN(offset) || offset < 0) {
        return c.json({ error: 'Invalid offset. Must be 0 or greater' }, 400);
      }

      const conversions = await productService.getProductConversions(productId, { limit, offset });
      return c.json(conversions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch product conversions' }, 500);
    }
  },
};
