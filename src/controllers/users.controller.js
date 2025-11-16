import { userService } from '../services/users.service.js';

export const usersController = {
  async getUsers(c) {
    try {
      const { limit = '10', offset = '0' } = c.req.query();
      const users = await userService.getUsers({ limit: Number(limit), offset: Number(offset) });
      return c.json(users);
    } catch (error) {
      console.error(error);
      return c.json({ error: error.message }, 500);
    }
  },

  async getUserById(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = Number(idStr);
      if (!userId) return c.json({ error: 'Invalid user_id' }, 400);
      const found = await userService.getUserById(userId);
      if (!found) return c.json({ error: 'User not found' }, 404);
      return c.json(found);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch user' }, 500);
    }
  },

  async createUser(c) {
    try {
      const body = await c.req.json();
      const created = await userService.createUser(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create user' }, 500);
    }
  },

  async updateUser(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = Number(idStr);
      if (!userId) return c.json({ error: 'Invalid user_id' }, 400);
      const body = await c.req.json();
      const updated = await userService.updateUser(userId, body);
      if (!updated) return c.json({ error: 'User not found' }, 404);
      return c.json(updated);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to update user' }, 500);
    }
  },

  async deleteUser(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = Number(idStr);
      if (!userId) return c.json({ error: 'Invalid user_id' }, 400);
      const found = await userService.getUserById(userId);
      if (!found) return c.json({ error: 'User not found' }, 404);
      await userService.deleteUser(userId);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete user' }, 500);
    }
  },

  async getUserCustomers(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = Number(idStr);
      if (!userId) return c.json({ error: 'Invalid user_id' }, 400);
      const { limit = '10', offset = '0' } = c.req.query();
      const customers = await userService.getUserCustomers(userId, { limit: Number(limit), offset: Number(offset) });
      return c.json(customers);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch user customers' }, 500);
    }
  },

  async getUserInteractions(c) {
    try {
      const idStr = c.req.param('user_id');
      const userId = Number(idStr);
      if (!userId) return c.json({ error: 'Invalid user_id' }, 400);
      const { limit = '10', offset = '0' } = c.req.query();
      const interactions = await userService.getUserInteractions(userId, { limit: Number(limit), offset: Number(offset) });
      return c.json(interactions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch user interactions' }, 500);
    }
  },
};
