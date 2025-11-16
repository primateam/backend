import { Hono } from 'hono';
import { usersController } from '../controllers/users.controller.js';

const userRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for users routes.');
};

userRouter.get('/', usersController.getUsers);
userRouter.get('/:user_id/', dummyHandler);
userRouter.patch('/:user_id/', dummyHandler);
userRouter.delete('/:user_id/', dummyHandler);

export default userRouter;
