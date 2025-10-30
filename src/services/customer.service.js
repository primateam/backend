import { db } from "../db";
import { customer } from "../db/schema";

class CustomerService {
  async getCustomers({ limit = 10 }) {
    try {
      const customers = await db.select().from(customer).limit(limit);
      return customers;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch customers");
    }
  }
}

export const customerService = new CustomerService();
