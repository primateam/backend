import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),

});

export const loginSchema = z.object({
  username: z.string().lowercase().required_error('Username is required').min(1, 'Username cannot be empty'),
  password: z.string().required_error('Password is required').min(1, 'Password cannot be empty'),
}).stirct();

export const tokenSchema = z.object({
  refresh_token: z.string()
    .required_error('Refresh token is required')
    .min(1, 'Refresh token cannot be empty'),
}).strict();

