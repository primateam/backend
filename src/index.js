import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";

import userRouter from "./routes/users.js";
import customerRouter from "./routes/customers.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello! Server Hono ini sedang berjalan.");
});

app.route("/users", userRouter);
app.route("/customers", customerRouter);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server running on ${info.address}:${info.port}`);
  },
);
