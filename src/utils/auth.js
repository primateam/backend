import { z } from 'zod';

const UserRoleEnum = z.enum(['admin', 'manager', 'sales']);

export const registerSchema = z.object({
  fullName: z.string({
    required_error: 'Nama lengkap (fullName) wajib diisi'
  }).min(1, 'Nama lengkap tidak boleh kosong'),

  username: z.string({
    required_error: 'Username wajib diisi'
  })
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh mengandung huruf, angka, dan underscore'),

  email: z.string({
    required_error: 'Email wajib diisi'
  }).email('Format email tidak valid'),

  password: z.string({
    required_error: 'Password wajib diisi'
  })
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password harus mengandung minimal satu huruf dan satu angka'),

  role: UserRoleEnum.optional(),

  teamId: z.coerce.number().int('ID tim harus berupa integer').positive('ID tim harus berupa angka positif').optional().nullable(),
}).strict();

export const loginSchema = z.object({
  username: z.string().lowercase().required_error('Username is required').min(1, 'Username cannot be empty'),
  password: z.string().required_error('Password is required').min(1, 'Password cannot be empty'),
}).strict();

export const tokenSchema = z.object({
  refresh_token: z.string()
    .required_error('Refresh token is required')
    .min(1, 'Refresh token cannot be empty'),
}).strict();