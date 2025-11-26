import { customerService } from '../services/customer.service.js';
import { idParamsSchema } from '../validators/crud.validator.js';
import logger from '../utils/logger.js';

export const customerController = {
  async getCustomers(c) {
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

      const result = await customerService.getCustomers({ limit, offset });
      return c.json(result);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async getCustomerById(c) {
    let idStr;

    try {
      idStr = c.req.param('customer_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const customerId = validateParams.id;

      const found = await customerService.getCustomerById(customerId);
      if (!found) return c.json({ error: 'Customer not found' }, 404);
      return c.json(found);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Customer ID format is invalid ' }, 400);
      }
      logger.error({ err: error, customerId: idStr }, 'Controller error: Failed to fetch customer');
      return c.json({ error: 'Failed to fetch customer' }, 500);
    }
  },

  async createCustomer(c) {
    try {
      const body = await c.req.json();

      // Basic validation for numeric fields
      if (body.age !== undefined && (isNaN(body.age) || body.age < 0 || body.age > 150)) {
        return c.json({ error: 'Invalid age. Must be between 0 and 150' }, 400);
      }

      if (body.assignedUserId !== undefined && body.assignedUserId !== null) {
        const userId = parseInt(body.assignedUserId, 10);
        if (isNaN(userId) || userId < 1) {
          return c.json({ error: 'Invalid assignedUserId' }, 400);
        }
        body.assignedUserId = userId;
      }

      const created = await customerService.createCustomer(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create customer' }, 500);
    }
  },

  async updateCustomer(c) {
    let idStr;

    try {
      idStr = c.req.param('customer_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const customerId = validateParams.id;

      const body = await c.req.json();

      // Validate numeric fields if present
      if (body.age !== undefined && (isNaN(body.age) || body.age < 0 || body.age > 150)) {
        return c.json({ error: 'Invalid age. Must be between 0 and 150' }, 400);
      }

      if (body.assignedUserId !== undefined && body.assignedUserId !== null) {
        const userId = parseInt(body.assignedUserId, 10);
        if (isNaN(userId) || userId < 1) {
          return c.json({ error: 'Invalid assignedUserId' }, 400);
        }
        body.assignedUserId = userId;
      }

      const updated = await customerService.updateCustomer(customerId, body);
      if (!updated) return c.json({ error: 'Customer not found' }, 404);
      return c.json(updated);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Customer ID format is invalid ' }, 400);
      }
      logger.error({ err: error, customerId: idStr }, 'Controller error: Failed to fetch customer');
      return c.json({ error: 'Failed to fetch customer' }, 500);
    }
  },

  async deleteCustomer(c) {
    let idStr;

    try {
      idStr = c.req.param('customer_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const customerId = validateParams.id;

      const deleted = await customerService.deleteCustomer(customerId);
      if (!deleted) return c.json({ error: 'Customer not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Customer ID format is invalid ' }, 400);
      }
      logger.error({ err: error, customerId: idStr }, 'Controller error: Failed to fetch customer');
      return c.json({ error: 'Failed to fetch customer' }, 500);
    }
  },

  async getCustomerInteractions(c) {
    let idStr;

    try {
      idStr = c.req.param('customer_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const customerId = validateParams.id;

      const interactions = await customerService.getCustomerInteractions(customerId);
      return c.json(interactions);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Customer ID format is invalid ' }, 400);
      }
      logger.error({ err: error, customerId: idStr }, 'Controller error: Failed to fetch customer');
      return c.json({ error: 'Failed to fetch customer' }, 500);
    }
  },
};
