import { Hono } from 'hono';
import { customerController } from '../controllers/customer.controller.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';

const customerRouter = new Hono();

customerRouter.get('/', customerController.getCustomers);
customerRouter.post(
  '/',
  idempotencyMiddleware(),
  customerController.createCustomer,
);
customerRouter.get('/:customer_id', customerController.getCustomerById);
customerRouter.patch('/:customer_id', customerController.updateCustomer);
customerRouter.delete('/:customer_id', customerController.deleteCustomer);
customerRouter.get(
  '/:customer_id/interactions',
  customerController.getCustomerInteractions,
);

export default customerRouter;
