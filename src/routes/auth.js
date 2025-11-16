import { Hono } from 'hono';
import { registerController } from '../controllers/auth/register';

const authRouter = new Hono();

const dummyHandler = (c) => {
  return c.text('This is a placeholder for auth routes.');
};

authRouter.post('/login', dummyHandler);
authRouter.post('/refresh', dummyHandler);
authRouter.post('/logout', dummyHandler);
authRouter.post('/register', registerController.register);

export default authRouter;