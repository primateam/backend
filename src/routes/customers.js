import { Hono } from "hono";
import { customerController } from "../controllers/customer.controller";

const customerRouter = new Hono();

customerRouter.get("/", customerController.getCustomers);

export default customerRouter;
