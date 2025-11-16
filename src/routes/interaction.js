import { Hono } from 'hono';

const interactionRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for teams routes.');
};

interactionRouter.get('/', dummyHandler);
interactionRouter.post('/', dummyHandler);
interactionRouter.get('/:interactions_id/', dummyHandler);
interactionRouter.patch('/:interactions_id/', dummyHandler);
interactionRouter.delete('/:interactions_id/', dummyHandler);

export default interactionRouter;