import { registerService } from '../../services/auth/register.js';
import logger from '../../utils/logger.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// min 8 chars, at least 1 letter and 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

export const registerController = {
  async register(c) {
    try {
      const body = await c.req.json();

      if (!body.fullName || !body.username || !body.email || !body.password) {
        logger.warn({ fields: Object.keys(body) }, 'Registration attempt with missing required fields');
        return c.json({ error: 'Full name, username, email, and password are required' }, 400);
      }

      // Username validation (3-50 chars, alphanumeric + underscore)
      if (body.username.length < 3 || body.username.length > 50) {
        return c.json({ error: 'Username must be between 3 and 50 characters' }, 400);
      }
      if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
        return c.json({ error: 'Username can only contain letters, numbers, and underscores' }, 400);
      }

      if (!EMAIL_REGEX.test(body.email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      if (!PASSWORD_REGEX.test(body.password)) {
        return c.json({
          error: 'Password must be at least 8 characters long and contain at least one letter and one number'
        }, 400);
      }

      if (body.role && !['admin', 'manager', 'sales'].includes(body.role)) {
        return c.json({ error: 'Invalid role. Must be admin, manager, or sales' }, 400);
      }

      if (body.teamId !== undefined && body.teamId !== null) {
        const teamIdNum = parseInt(body.teamId, 10);
        if (isNaN(teamIdNum) || teamIdNum < 1) {
          return c.json({ error: 'Invalid team ID' }, 400);
        }
        body.teamId = teamIdNum;
      }

      const newUser = await registerService.registerUser(body);

      logger.info({
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }, 'User registered successfully');

      return c.json(newUser, 201);
    } catch (error) {
      logger.error({ err: error, message: error.message }, 'Failed to register user');

      if (error.message.includes('already exists')) {
        return c.json({ error: error.message }, 409);
      }

      return c.json({ error: 'Failed to register user' }, 500);
    }
  }
};