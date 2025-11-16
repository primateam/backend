import { Hono } from 'hono';

const teamsRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for teams routes.');
};

teamsRouter.get('/', dummyHandler);
teamsRouter.post('/', dummyHandler);
teamsRouter.get('/:team_id/users', dummyHandler);
teamsRouter.get('/:team_id/customers', dummyHandler);

export default teamsRouter;