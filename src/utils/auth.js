import { z } from 'zod';

const UserRoleEnum = z.enum(['admin', 'manager', 'sales']);

export const registerSchema = z
  .object({
    fullName: z
      .string({
        required_error: 'FullName is required',
      })
      .min(1, 'Full Name not null'),

    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(3, 'Username min 3 character')
      .max(50, 'Username maks 50 character')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username hanya boleh mengandung huruf, angka, dan underscore',
      ),

    email: z
      .string({
        required_error: 'Email wajib diisi',
      })
      .email('Format email tidak valid'),

    password: z
      .string({
        required_error: 'Password wajib diisi',
      })
      .min(8, 'Password minimal 8 karakter')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        'Password harus mengandung minimal satu huruf dan satu angka',
      ),

    role: UserRoleEnum.optional(),

    teamId: z.coerce
      .number()
      .int('ID tim harus berupa integer')
      .positive('ID tim harus berupa angka positif')
      .optional()
      .nullable(),
  })
  .strict();

export const loginSchema = z
  .object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(1, 'Username cannot be empty')
      .transform((val) => val.toLowerCase()),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(1, 'Password cannot be empty'),
  })
  .strict();

export const tokenSchema = z
  .object({
    refresh_token: z
      .string({
        required_error: 'Refresh token is required',
      })
      .min(1, 'Refresh token cannot be empty'),
  })
  .strict();
