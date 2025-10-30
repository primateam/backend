import { customerService } from "../services/customer.service.js";

export const customerController = {
  async getCustomers(c) {
    try {
      const { limit } = c.req.query();
      const customers = await customerService.getCustomers({ limit });
      return c.json(customers);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
};
