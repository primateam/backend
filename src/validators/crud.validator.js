import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
}).strict();

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty').optional(),
  filter: z.string().min(1, 'Filter cannot be empty').optional(),
  sort: z.string().min(1, 'Sort cannot be empty').optional(),
}).strict();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  offset: z.coerce.number().int().min(0, 'Offset cannot be negative').default(),
}).strict();