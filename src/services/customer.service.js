import { db } from '../db/index.js';
import { customer, interaction } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

const CUSTOMER_FIELDS = [
  'age',
  'job',
  'maritalStatus',
  'education',
  'hasCreditDefault',
  'balance',
  'housingLoan',
  'personalLoan',
  'assignedUserId',
  'predictionScore',
  'customerSegment',
  'leadStatus',
  'lastEngagedAt',
];

const sanitizeCustomerPayload = (payload) => {
  const sanitized = {};
  for (const field of CUSTOMER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      sanitized[field] = payload[field];
    }
  }
  return sanitized;
};

class CustomerService {
  async getCustomers({ limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(customer);

      const customers = await db
        .select()
        .from(customer)
        .limit(limit)
        .offset(offset);

      return {
        data: customers,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch customer list');
      throw new Error('Failed to fetch customers');
    }
  }

  async getCustomerById(customerId) {
    try {
      const [record] = await db
        .select()
        .from(customer)
        .where(eq(customer.customerId, customerId))
        .limit(1);
      return record || null;
    } catch (error) {
      logger.error({ err: error, customerId }, 'Failed to fetch customer by ID');
      throw new Error('Failed to fetch the customer');
    }
  }

  async createCustomer(payload) {
    try {
      const sanitized = sanitizeCustomerPayload(payload);
      const [created] = await db
        .insert(customer)
        .values(sanitized)
        .returning({
          customerId: customer.customerId,
          ...customer,
        });
      return created;
    } catch (error) {
      logger.error({ err: error, payload }, 'Failed to create new customer record');
      throw new Error('Failed to create customer');
    }
  }

  async updateCustomer(customerId, updates) {
    try {
      const sanitized = sanitizeCustomerPayload(updates);
      const [updated] = await db
        .update(customer)
        .set(sanitized)
        .where(eq(customer.customerId, customerId))
        .returning({
          customerId: customer.customerId,
          ...customer,
        });
      return updated || null;
    } catch (error) {
      logger.error({ err: error, customerId, updates }, 'Failed to update customer record');
      throw new Error('Failed to update customer');
    }
  }

  async deleteCustomer(customerId) {
    try {
      const result = await db
        .delete(customer)
        .where(eq(customer.customerId, customerId))
        .returning({ customerId: customer.customerId });
      return result.length > 0;
    } catch (error) {
      logger.error({ err: error, customerId }, 'Failed to delete customer record');
      throw new Error('Failed to delete customer');
    }
  }

  async getCustomerInteractions(customerId) {
    try {
      return await db
        .select()
        .from(interaction)
        .where(eq(interaction.customerId, customerId));
    } catch (error) {
      logger.error({ err: error, customerId }, 'Failed to fetch customer interactions');
      throw new Error('Failed to fetch customer interactions');
    }
  }
}

export const customerService = new CustomerService();
