import { user } from '../../db/schema.js';
import { db } from '../../db/index.js';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

class RegisterService {
  async registerUser(userData) {
    try {
      const { fullName, username, email, password, role, teamId } = userData;

      // Check if username or email already exists
      const existingUser = await db
        .select()
        .from(user)
        .where(or(eq(user.username, username), eq(user.email, email)))
        .limit(1);

      if (existingUser.length > 0) {
        if (existingUser[0].username === username) {
          throw new Error('Username already exists');
        }
        if (existingUser[0].email === email) {
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
      return newUser[0];
    } catch (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }
}

export const registerService = new RegisterService();
