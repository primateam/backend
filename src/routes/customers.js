import { Hono } from "hono";
import { customerController } from "../controllers/customer.controller.js";

const customerRouter = new Hono();

customerRouter.get("/", customerController.getCustomers);

export default customerRouter;
