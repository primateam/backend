import { userService } from '../services/users.service.js';
import logger from '../utils/logger.js';

export const usersController = {
  async getUsers(c) {
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

      const result = await userService.getUsers({ limit, offset });
      return c.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to get users');
      return c.json({ error: error.message }, 500);
    }
  },

  async getUserById(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = parseInt(idStr, 10);

      if (isNaN(userId) || userId < 1) {
        return c.json({ error: 'Invalid user_id' }, 400);
      }

      const found = await userService.getUserById(userId);
      if (!found) return c.json({ error: 'User not found' }, 404);
      return c.json(found);
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to get user by ID');
      return c.json({ error: 'Failed to fetch user' }, 500);
    }
  },

  async createUser(c) {
    try {
      const body = await c.req.json();

      if (!body.username || !body.email || !body.password) {
        return c.json({ error: 'Username, email, and password are required' }, 400);
      }

      const created = await userService.createUser(body);
      return c.json(created, 201);
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to create user');
      return c.json({ error: 'Failed to create user' }, 500);
    }
  },

  async updateUser(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = parseInt(idStr, 10);

      if (isNaN(userId) || userId < 1) {
        return c.json({ error: 'Invalid user_id' }, 400);
      }

      const body = await c.req.json();
      const updated = await userService.updateUser(userId, body);
      if (!updated) return c.json({ error: 'User not found' }, 404);
      return c.json(updated);
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to update user');
      return c.json({ error: 'Failed to update user' }, 500);
    }
  },

  async deleteUser(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = parseInt(idStr, 10);

      if (isNaN(userId) || userId < 1) {
        return c.json({ error: 'Invalid user_id' }, 400);
      }

      const deleted = await userService.deleteUser(userId);
      if (!deleted) return c.json({ error: 'User not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to delete user');
      return c.json({ error: 'Failed to delete user' }, 500);
    }
  },

  async getUserCustomers(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = parseInt(idStr, 10);

      if (isNaN(userId) || userId < 1) {
        return c.json({ error: 'Invalid user_id' }, 400);
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

      const customers = await userService.getUserCustomers(userId, { limit, offset });
      return c.json(customers);
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to fetch user customers');
      return c.json({ error: 'Failed to fetch user customers' }, 500);
    }
  },

  async getUserInteractions(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = parseInt(idStr, 10);

      if (isNaN(userId) || userId < 1) {
        return c.json({ error: 'Invalid user_id' }, 400);
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

      const interactions = await userService.getUserInteractions(userId, { limit, offset });
      return c.json(interactions);
    } catch (error) {
      logger.error({ err: error }, 'Controller error: failed to fetch user interactions');
      return c.json({ error: 'Failed to fetch user interactions' }, 500);
    }
  },
};
