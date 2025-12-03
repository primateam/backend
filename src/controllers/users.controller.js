import { userService } from '../services/users.service.js';
import { parsePaginationParams, parseIdParam, parseRequestBody, parseFilterParams, parseSearchParam } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import { validate, createUserSchema, updateUserSchema } from '../utils/validation.js';

export const usersController = {
  async getUsers(c) {
    const { limit, offset } = parsePaginationParams(c);
    const filters = parseFilterParams(c, ['role', 'teamId']);
    const searchQuery = parseSearchParam(c);
    const result = await userService.getUsers({ limit, offset, filters, searchQuery });
    return sendSuccess(c, result);
  },

  async getUserById(c) {
    const userId = parseIdParam(c, 'user_id');
    const found = await userService.getUserById(userId);
    return sendSuccess(c, found);
  },

  async createUser(c) {
    const body = await parseRequestBody(c);
    const validated = validate(createUserSchema, body);
    const created = await userService.createUser(validated);
    return sendSuccess(c, created, 201);
  },

  async updateUser(c) {
    const userId = parseIdParam(c, 'user_id');
    const body = await parseRequestBody(c);
    const validated = validate(updateUserSchema, body);
    const updated = await userService.updateUser(userId, validated);
    return sendSuccess(c, updated);
  },

  async deleteUser(c) {
    const userId = parseIdParam(c, 'user_id');
    await userService.deleteUser(userId);
    return sendSuccess(c, { deleted: true });
  },

  async getUserCustomers(c) {
    const userId = parseIdParam(c, 'user_id');
    const { limit, offset } = parsePaginationParams(c);
    const customers = await userService.getUserCustomers(userId, { limit, offset });
    return sendSuccess(c, customers);
  },

  async getUserInteractions(c) {
    const userId = parseIdParam(c, 'user_id');
    const { limit, offset } = parsePaginationParams(c);
    const interactions = await userService.getUserInteractions(userId, { limit, offset });
    return sendSuccess(c, interactions);
  },
};
