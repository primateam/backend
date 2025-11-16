import { productService } from '../services/product.service.js';

export const productController = {
  async getProducts(c) {
    try {
      const { limit = '10', offset = '0' } = c.req.query();
      const products = await productService.getProducts({ limit: Number(limit), offset: Number(offset) });
      return c.json(products);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch products' }, 500);
    }
  },

  async getProductById(c) {
    try {
      const idStr = c.req.param('product_id');
      const productId = Number(idStr);
      if (!productId) return c.json({ error: 'Invalid product_id' }, 400);
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
      const productId = Number(idStr);
      if (!productId) return c.json({ error: 'Invalid product_id' }, 400);
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
      const productId = Number(idStr);
      if (!productId) return c.json({ error: 'Invalid product_id' }, 400);
      const found = await productService.getProductById(productId);
      if (!found) return c.json({ error: 'Product not found' }, 404);
      await productService.deleteProduct(productId);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete product' }, 500);
    }
  },

  async getProductConversions(c) {
    try {
      const idStr = c.req.param('product_id');
      const productId = Number(idStr);
      if (!productId) return c.json({ error: 'Invalid product_id' }, 400);
      const { limit = '10', offset = '0' } = c.req.query();
      const conversions = await productService.getProductConversions(productId, { limit: Number(limit), offset: Number(offset) });
      return c.json(conversions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch product conversions' }, 500);
    }
  },
};
