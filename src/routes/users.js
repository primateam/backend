import { Hono } from 'hono';
import { usersController } from '../controllers/users.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';

const userRouter = new Hono();
const accessPermission = authMiddleware(['admin', 'manager']);

userRouter.get('/', usersController.getUsers);
userRouter.post('/', idempotencyMiddleware(), accessPermission, usersController.createUser);
userRouter.get('/:user_id/', usersController.getUserById);
userRouter.patch('/:user_id/', accessPermission, usersController.updateUser);
userRouter.delete('/:user_id/', accessPermission, usersController.deleteUser);
userRouter.get('/:user_id/customers', usersController.getUserCustomers);
userRouter.get('/:user_id/interactions', usersController.getUserInteractions);

export default userRouter;
