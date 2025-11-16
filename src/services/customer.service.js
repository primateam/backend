import { db } from '../db/index.js';
import { customer } from '../db/schema.js';

class CustomerService {
  async getCustomers({ limit = 10 }) {
    try {
      return await db.select().from(customer).limit(limit);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch customers');
    }
  }
}

export const customerService = new CustomerService();
