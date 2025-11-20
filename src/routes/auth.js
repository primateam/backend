import { Hono } from 'hono';
import { registerController } from '../controllers/auth/register.js';
import { refreshController } from '../controllers/auth/refresh.js';
import { logoutController } from '../controllers/auth/logout.js';
import { loginController } from '../controllers/auth/login.js';

const authRouter = new Hono();

authRouter.post('/login', loginController.login);
authRouter.post('/refresh', refreshController.refresh);
authRouter.post('/logout', logoutController.logout);
authRouter.post('/register', registerController.register);

export default authRouter;