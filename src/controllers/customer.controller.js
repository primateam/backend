import { customerService } from '../services/customer.service.js';
import { parsePaginationParams, parseIdParam, parseRequestBody, parseFilterParams, parseSearchParam } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import { validate, createCustomerSchema, updateCustomerSchema } from '../utils/validation.js';

export const customerController = {
  async getCustomers(c) {
    const { limit, offset } = parsePaginationParams(c);
    const filters = parseFilterParams(c, ['job', 'education', 'leadStatus', 'assignedUserId']);
    const searchQuery = parseSearchParam(c);
    const result = await customerService.getCustomers({ limit, offset, filters, searchQuery });
    return sendSuccess(c, result);
  },

  async getCustomerById(c) {
    const customerId = parseIdParam(c, 'customer_id');
    const found = await customerService.getCustomerById(customerId);
    return sendSuccess(c, found);
  },

  async createCustomer(c) {
    const body = await parseRequestBody(c);
    const validated = validate(createCustomerSchema, body);
    const created = await customerService.createCustomer(validated);
    return sendSuccess(c, created, 201);
  },

  async updateCustomer(c) {
    const customerId = parseIdParam(c, 'customer_id');
    const body = await parseRequestBody(c);
    const validated = validate(updateCustomerSchema, body);
    const updated = await customerService.updateCustomer(customerId, validated);
    return sendSuccess(c, updated);
  },

  async deleteCustomer(c) {
    const customerId = parseIdParam(c, 'customer_id');
    await customerService.deleteCustomer(customerId);
    return sendSuccess(c, { deleted: true });
  },

  async getCustomerInteractions(c) {
    const customerId = parseIdParam(c, 'customer_id');
    const { limit, offset } = parsePaginationParams(c);
    const interactions = await customerService.getCustomerInteractions(customerId, { limit, offset });
    return sendSuccess(c, interactions);
  },
};
