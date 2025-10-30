import { db } from "../db";
import { user } from "../db/schema";

class UserService {
  async getUsers({ limit = 10 }) {
    try {
      const users = await db.select().from(user).limit(limit);
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
}

export const userService = new UserService();
