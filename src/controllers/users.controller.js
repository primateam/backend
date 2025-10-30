import { userService } from "../services/users.service.js";

export const usersController = {
  async getUsers(c) {
    try {
      const { limit } = c.req.query();
      const users = await userService.getUsers({ limit });
      return c.json(users);
    } catch (error) {
      console.error(error);
      return c.json({ error: error.message }, 500);
    }
  },
};
