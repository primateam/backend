import { Hono } from 'hono';

const productsRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for products routes.');
};

productsRouter.get('/', dummyHandler);
productsRouter.post('/', dummyHandler);
productsRouter.get('/:product_id/', dummyHandler);
productsRouter.patch('/:product_id/', dummyHandler);
productsRouter.delete('/:product_id/', dummyHandler);

export default productsRouter;