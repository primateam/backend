import { serve } from '@hono/node-server'; 
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { db } from './db/index.js'; 

import { 
  user, 
  customer, 
} from './db/schema.js'; 

const app = new Hono();

app.use('*', logger());

app.get('/', (c) => {
  return c.text('Hello! Server Hono ini sedang berjalan.');
});

app.get('/users', async (c) => {
  try {
    const allUsers = await db.select().from(user).limit(10);
    return c.json(allUsers);
  } catch (error) {
    console.error(error); 
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.get('/customers', async (c) => {
  try {
    const allCustomers = await db.select().from(customer).limit(10);
    return c.json(allCustomers);
  } catch (error) {
    console.error(error); 
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

const port = 3000;

console.log(`Server Hono sedang berjalan dan mendengarkan di http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Server Hono benar-benar aktif di: ${info.address}:${info.port}`);
});