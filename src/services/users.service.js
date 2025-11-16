import {db} from '../db/index.js';
import {user} from '../db/schema.js';

class UserService {
  async getUsers({ limit = 10 }) {
    try {
      return await db.select().from(user).limit(limit);
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
}

export const userService = new UserService();
