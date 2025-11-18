import { user } from '../../db/schema.js';
import { db } from '../../db/index.js';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import logger from '../../utils/logger.js';

class RegisterService {
  async registerUser(userData) {
    try {
      const { fullName, username, email, password, role, teamId } = userData;

      const existingUser = await db
        .select()
        .from(user)
        .where(or(eq(user.username, username), eq(user.email, email)))
        .limit(1);

      if (existingUser.length > 0) {
        if (existingUser[0].username === username) {
          logger.warn({ username }, 'Registration blocked: username already exists');
          throw new Error('Username already exists');
        }
        if (existingUser[0].email === email) {
          logger.warn({ email }, 'Registration blocked: email already exists');
          throw new Error('Email already exists');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await db
        .insert(user)
        .values({
          fullName,
          username,
          email,
          password: hashedPassword,
          role,
          teamId,
        })
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

      logger.debug({ userId: newUser[0].userId, username }, 'User created in database');
      return newUser[0];
    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Failed to register user in service');
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }
}

export const registerService = new RegisterService();
