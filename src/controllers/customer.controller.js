import { customerService } from '../services/customer.service.js';

export const customerController = {
  async getCustomers(c) {
    try {
      const { limit = '10', offset = '0' } = c.req.query();
      const customers = await customerService.getCustomers({ limit: Number(limit), offset: Number(offset) });
      return c.json(customers);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  },

  async getCustomerById(c) {
    try {
      const idStr = c.req.param('customer_id');
      const customerId = Number(idStr);
      if (!customerId) return c.json({ error: 'Invalid customer_id' }, 400);
      const found = await customerService.getCustomerById(customerId);
      if (!found) return c.json({ error: 'Customer not found' }, 404);
      return c.json(found);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch customer' }, 500);
    }
  },

  async createCustomer(c) {
    try {
      const body = await c.req.json();
      const created = await customerService.createCustomer(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create customer' }, 500);
    }
  },

  async updateCustomer(c) {
    try {
      const idStr = c.req.param('customer_id');
      const customerId = Number(idStr);
      if (!customerId) return c.json({ error: 'Invalid customer_id' }, 400);
      const body = await c.req.json();
      const updated = await customerService.updateCustomer(customerId, body);
      if (!updated) return c.json({ error: 'Customer not found' }, 404);
      return c.json(updated);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to update customer' }, 500);
    }
  },

  async deleteCustomer(c) {
    try {
      const idStr = c.req.param('customer_id');
      const customerId = Number(idStr);
      if (!customerId) return c.json({ error: 'Invalid customer_id' }, 400);
      const found = await customerService.getCustomerById(customerId);
      if (!found) return c.json({ error: 'Customer not found' }, 404);
      await customerService.deleteCustomer(customerId);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete customer' }, 500);
    }
  },

  async getCustomerInteractions(c) {
    try {
      const idStr = c.req.param('customer_id');
      const customerId = Number(idStr);
      if (!customerId) return c.json({ error: 'Invalid customer_id' }, 400);
      const interactions = await customerService.getCustomerInteractions(customerId);
      return c.json(interactions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch customer interactions' }, 500);
    }
  },
};
