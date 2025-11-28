import { db } from '../db/index.js';
import { user, customer, interaction } from '../db/schema.js';
import { eq, sql, and, or, like } from 'drizzle-orm';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import { NotFoundError, DatabaseError, ConflictError } from '../errors/index.js';
import { buildPaginatedResponse } from '../utils/response.js';

const USER_FIELDS = [
  'fullName',
  'username',
  'email',
  'password',
  'role',
  'teamId',
];

// excludes password
const PUBLIC_USER_SELECT = {
  userId: user.userId,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  teamId: user.teamId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

const sanitizeUserPayload = (payload) => {
  const sanitized = {};
  for (const field of USER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      sanitized[field] = payload[field];
    }
  }
  return sanitized;
};

class UserService {
  async getUsers({ limit = 10, offset = 0, filters, searchQuery } = {}) {
    try {
      const whereConditions = [];

      if (filters.role) {
        whereConditions.push(eq(user.role, filters.role));
      }
      if (filters.teamId) {
        whereConditions.push(eq(user.teamId, parseInt(filters.teamId, 10)));
      }

      if (searchQuery) {
        const searchLike = `%${searchQuery}%`;
        whereConditions.push(
          or(
            like(user.fullName, searchLike),
            like(user.username, searchLike),
            like(user.email, searchLike)
          )
        );
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(user)
        .where(whereClause);

      const users = await db
        .select(PUBLIC_USER_SELECT)
        .from(user)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(users, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch users');
      throw new DatabaseError('Failed to fetch users', error);
    }
  }

  async getUserById(userId) {
    try {
      const [record] = await db
        .select(PUBLIC_USER_SELECT)
        .from(user)
        .where(eq(user.userId, userId))
        .limit(1);

      if (!record) {
        throw new NotFoundError('User', userId);
      }

      return record;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, userId }, 'Failed to fetch user by ID');
      throw new DatabaseError('Failed to fetch user', error);
    }
  }

  async getUserByUsername(username) {
    try {
      const [record] = await db
        .select()
        .from(user)
        .where(eq(user.username, username))
        .limit(1);

      return record || null;
    } catch (error) {
      logger.error({ err: error, username }, 'Failed to fetch user by username');
      throw new DatabaseError('Failed to fetch user by username', error);
    }
  }

  async getUserByEmail(email) {
    try {
      const [record] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      return record || null;
    } catch (error) {
      logger.error({ err: error, email }, 'Failed to fetch user by email');
      throw new DatabaseError('Failed to fetch user by email', error);
    }
  }

  async createUser(payload) {
    try {
      const { password, ...restPayload } = payload;

      const hashedPassword = await bcrypt.hash(password, 10);

      const sanitized = sanitizeUserPayload({
        ...restPayload,
        password: hashedPassword,
      });

      const [created] = await db
        .insert(user)
        .values(sanitized)
        .returning(PUBLIC_USER_SELECT);

      logger.info({ userId: created.userId, username: created.username }, 'User created');
      return created;
    } catch (error) {
      // Handle unique constraint violations (duplicate username/email)
      if (error.code === '23505') {
        const field = error.constraint?.includes('username') ? 'username' : 'email';
        throw new ConflictError(`User with this ${field} already exists`, field);
      }
      logger.error({ err: error, payload: sanitizeUserPayload(payload) }, 'Failed to create user');
      throw new DatabaseError('Failed to create user', error);
    }
  }

  async updateUser(userId, updates) {
    try {
      const sanitized = sanitizeUserPayload(updates);

      if (sanitized.password) {
        sanitized.password = await bcrypt.hash(sanitized.password, 10);
      }

      const [updated] = await db
        .update(user)
        .set(sanitized)
        .where(eq(user.userId, userId))
        .returning(PUBLIC_USER_SELECT);

      if (!updated) {
        throw new NotFoundError('User', userId);
      }

      logger.info({ userId, username: updated.username }, 'User updated');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      // Handle unique constraint violations
      if (error.code === '23505') {
        const field = error.constraint?.includes('username') ? 'username' : 'email';
        throw new ConflictError(`User with this ${field} already exists`, field);
      }
      logger.error({ err: error, userId }, 'Failed to update user');
      throw new DatabaseError('Failed to update user', error);
    }
  }

  async deleteUser(userId) {
    try {
      const result = await db.delete(user).where(eq(user.userId, userId)).returning({ userId: user.userId });

      if (result.length === 0) {
        throw new NotFoundError('User', userId);
      }

      logger.info({ userId }, 'User deleted');
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, userId }, 'Failed to delete user');
      throw new DatabaseError('Failed to delete user', error);
    }
  }

  async getUserCustomers(userId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(customer)
        .where(eq(customer.assignedUserId, userId));

      const customers = await db
        .select()
        .from(customer)
        .where(eq(customer.assignedUserId, userId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(customers, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, userId, limit, offset }, 'Failed to fetch user customers');
      throw new DatabaseError('Failed to fetch user customers', error);
    }
  }

  async getUserInteractions(userId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(interaction)
        .where(eq(interaction.userId, userId));

      const interactions = await db
        .select()
        .from(interaction)
        .where(eq(interaction.userId, userId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(interactions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, userId, limit, offset }, 'Failed to fetch user interactions');
      throw new DatabaseError('Failed to fetch user interactions', error);
    }
  }
}

export const userService = new UserService();
