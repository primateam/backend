import { Hono } from 'hono';
import { customerController } from '../controllers/customer.controller.js';


const customerRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for customers routes.');
};

customerRouter.get('/', customerController.getCustomers);
customerRouter.post('/', dummyHandler);
customerRouter.get('/:customer_id/', dummyHandler);
customerRouter.patch('/:customer_id/', dummyHandler);
customerRouter.delete('/:customer_id/', dummyHandler);
customerRouter.get('/:customer_id/interactions', dummyHandler);

export default customerRouter;
