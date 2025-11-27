import { db } from '../db/index.js';
import { customer, interaction } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../errors/index.js';
import { buildPaginatedResponse } from '../utils/response.js';

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

      return buildPaginatedResponse(customers, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch customers');
      throw new DatabaseError('Failed to fetch customers', error);
    }
  }

  async getCustomerById(customerId) {
    try {
      const [record] = await db
        .select()
        .from(customer)
        .where(eq(customer.customerId, customerId))
        .limit(1);

      if (!record) {
        throw new NotFoundError('Customer', customerId);
      }

      return record;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, customerId }, 'Failed to fetch customer');
      throw new DatabaseError('Failed to fetch customer', error);
    }
  }

  async createCustomer(payload) {
    try {
      const sanitized = sanitizeCustomerPayload(payload);
      const [created] = await db
        .insert(customer)
        .values(sanitized)
        .returning();

      logger.info({ customerId: created.customerId }, 'Customer created');
      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeCustomerPayload(payload) }, 'Failed to create customer record');
      throw new DatabaseError('Failed to create customer', error);
    }
  }

  async updateCustomer(customerId, updates) {
    try {
      const sanitized = sanitizeCustomerPayload(updates);
      const [updated] = await db
        .update(customer)
        .set(sanitized)
        .where(eq(customer.customerId, customerId))
        .returning();

      if (!updated) {
        throw new NotFoundError('Customer', customerId);
      }

      logger.info({ customerId }, 'Customer updated');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, customerId, updates: sanitizeCustomerPayload(updates) }, 'Failed to update customer record');
      throw new DatabaseError('Failed to update customer', error);
    }
  }

  async deleteCustomer(customerId) {
    try {
      const result = await db
        .delete(customer)
        .where(eq(customer.customerId, customerId))
        .returning({ customerId: customer.customerId });

      if (result.length === 0) {
        throw new NotFoundError('Customer', customerId);
      }

      logger.info({ customerId }, 'Customer deleted');
      return true;
    } catch (error) {
      logger.error({ err: error, customerId }, 'Failed to delete customer');
      throw new DatabaseError('Failed to delete customer', error);
    }
  }

  async getCustomerInteractions(customerId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(interaction)
        .where(eq(interaction.customerId, customerId));

      const interactions = await db
        .select()
        .from(interaction)
        .where(eq(interaction.customerId, customerId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(interactions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, customerId }, 'Failed to fetch customer interactions');
      throw new DatabaseError('Failed to fetch customer interactions', error);
    }
  }
}

export const customerService = new CustomerService();
