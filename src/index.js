import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

import userRouter from './routes/users.js';
import customerRouter from './routes/customers.js';
import authRouter from './routes/auth.js';
import teamRouter from './routes/teams.js';
import interactionRouter from './routes/interaction.js';
import productRouter from './routes/products.js';
import conversionRouter from './routes/conversion.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new Hono();

app.use('*', logger());

const v1 = new Hono();

v1.route('/auth', authRouter);
v1.route('/users', userRouter);
v1.route('/teams', teamRouter);
v1.route('/customers', customerRouter);
v1.route('/interactions', interactionRouter);
v1.route('/products', productRouter);
v1.route('/conversions', conversionRouter);

app.route('/v1', v1);

app.get('/', (c) => {
  return c.text('Hello! Server Hono ini sedang berjalan.');
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server running on ${info.address}:${info.port}`);
  },
);
