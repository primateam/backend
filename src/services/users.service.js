import { db } from '../db/index.js';
import { user, customer, interaction } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const USER_FIELDS = [
  'fullName',
  'username',
  'email',
  'password',
  'role',
  'teamId',
];

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
  async getUsers({ limit = 10, offset = 0 } = {}) {
    try {
      return await db.select().from(user).limit(limit).offset(offset);
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const [record] = await db
        .select()
        .from(user)
        .where(eq(user.userId, userId))
        .limit(1);

      return record || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch the user');
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
      console.error(error);
      throw new Error('Failed to fetch user by username');
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
      console.error(error);
      throw new Error('Failed to fetch user by email');
    }
  }

  async createUser(payload) {
    try {
      const sanitized = sanitizeUserPayload(payload);
      const [created] = await db
        .insert(user)
        .values(sanitized)
        .returning({
          userId: user.userId,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });

      return created;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(userId, updates) {
    try {
      const sanitized = sanitizeUserPayload(updates);
      const [updated] = await db
        .update(user)
        .set(sanitized)
        .where(eq(user.userId, userId))
        .returning({
          userId: user.userId,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });

      return updated || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId) {
    try {
      await db.delete(user).where(eq(user.userId, userId));
      return true;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete user');
    }
  }

  async getUserCustomers(userId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(customer)
        .where(eq(customer.assignedUserId, userId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch user customers');
    }
  }

  async getUserInteractions(userId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(interaction)
        .where(eq(interaction.userId, userId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch user interactions');
    }
  }
}

export const userService = new UserService();
