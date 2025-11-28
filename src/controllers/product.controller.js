import { productService } from '../services/product.service.js';
import { parsePaginationParams, parseIdParam, parseRequestBody, parseSearchParam } from '../utils/pagination.js';
import { validate, createProductSchema, updateProductSchema } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';

export const productController = {
  async getProducts(c) {
    const { limit, offset } = parsePaginationParams(c);
    const searchQuery = parseSearchParam(c);
    const products = await productService.getProducts({ limit, offset, searchQuery });
    return sendSuccess(c, products);
  },

  async getProductById(c) {
    const productId = parseIdParam(c, 'product_id');
    const found = await productService.getProductById(productId);
    return sendSuccess(c, found);
  },

  async createProduct(c) {
    const body = await parseRequestBody(c);
    const validated = validate(createProductSchema, body);
    const created = await productService.createProduct(validated);
    return sendSuccess(c, created, 201);
  },

  async updateProduct(c) {
    const productId = parseIdParam(c, 'product_id');
    const body = await parseRequestBody(c);
    const validated = validate(updateProductSchema.partial(), body);
    const updated = await productService.updateProduct(productId, validated);
    return sendSuccess(c, updated);
  },

  async deleteProduct(c) {
    const productId = parseIdParam(c, 'product_id');
    await productService.deleteProduct(productId);
    return sendSuccess(c, { deleted: true }, 204);
  },

  async getProductConversions(c) {
    const productId = parseIdParam(c, 'product_id');
    const { limit, offset } = parsePaginationParams(c);
    const conversions = await productService.getProductConversions(productId, { limit, offset });
    return sendSuccess(c, conversions);
  },
};
