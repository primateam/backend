import { Hono } from 'hono';

const conversionRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for conversion routes.');
};

conversionRouter.get('/', dummyHandler);
conversionRouter.post('/', dummyHandler);
conversionRouter.get('/:conversion_id/', dummyHandler);
conversionRouter.patch('/:conversion_id/', dummyHandler);

export default conversionRouter;