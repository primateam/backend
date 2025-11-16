import { Hono } from 'hono';
import { usersController } from '../controllers/users.controller.js';

const userRouter = new Hono();

userRouter.get('/', usersController.getUsers);
userRouter.post('/', usersController.createUser);
userRouter.get('/:user_id/', usersController.getUserById);
userRouter.patch('/:user_id/', usersController.updateUser);
userRouter.delete('/:user_id/', usersController.deleteUser);
userRouter.get('/:user_id/customers', usersController.getUserCustomers);
userRouter.get('/:user_id/interactions', usersController.getUserInteractions);

export default userRouter;
