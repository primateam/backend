import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/authMiddleware.js';

import userRouter from './routes/users.js';
import customerRouter from './routes/customers.js';
import authRouter from './routes/auth.js';
import teamRouter from './routes/teams.js';
import interactionRouter from './routes/interaction.js';
import productRouter from './routes/products.js';
import conversionRouter from './routes/conversion.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new Hono();

app.use('*', async (c, next) => {
  const start = Date.now();
  const { method, path } = c.req;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info({
    method,
    path,
    status,
    duration,
    ip: c.req.header('x-forwarded-for') || 'unknown',
  }, `${method} ${path} ${status} - ${duration}ms`);
});

const v1 = new Hono();

v1.route('/auth', authRouter);

v1.use('/users/*', authMiddleware());
v1.use('/teams/*', authMiddleware());
v1.use('/customers/*', authMiddleware());
v1.use('/interactions/*', authMiddleware());
v1.use('/products/*', authMiddleware());
v1.use('/conversions/*', authMiddleware());

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

app.onError(errorHandler);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    logger.info({
      port: info.port,
      address: info.address,
      env: process.env.NODE_ENV || 'development',
    }, `Server running on ${info.address}:${info.port}`);
  },
);
