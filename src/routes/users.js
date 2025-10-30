import { Hono } from "hono";
import { usersController } from "../controllers/users.controller.js";

const userRouter = new Hono();

userRouter.get("/", usersController.getUsers);

export default userRouter;
