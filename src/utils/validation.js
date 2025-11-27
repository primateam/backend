import { z } from 'zod';
import { ValidationError } from '../errors/index.js';

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const positiveIntSchema = z.coerce.number().int().positive();

export const createUserSchema = z.object({
  fullName: z.string().trim().min(1).max(256).optional(),
  username: z.string().trim().min(3).max(100),
  email: z.email().trim().max(256),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'sales']),
  teamId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(1).max(256).optional(),
  username: z.string().trim().min(3).max(100).optional(),
  email: z.email().trim().max(256).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'manager', 'sales']).optional(),
  teamId: z.coerce.number().int().positive().optional().nullable(),
}).strict();

export const createCustomerSchema = z.object({
  age: z.coerce.number().int().min(0).max(150).optional().nullable(),
  job: z.string().trim().max(100).optional().nullable(),
  maritalStatus: z.string().trim().max(50).optional().nullable(),
  education: z.string().trim().max(100).optional().nullable(),
  hasCreditDefault: z.boolean().optional().nullable(),
  balance: z.coerce.number().optional().nullable(),
  housingLoan: z.boolean().optional().nullable(),
  personalLoan: z.boolean().optional().nullable(),
  assignedUserId: z.coerce.number().int().positive().optional().nullable(),
  predictionScore: z.coerce.number().optional().nullable(),
  customerSegment: z.string().trim().max(100).optional().nullable(),
  leadStatus: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']).optional().nullable(),
  lastEngagedAt: z.iso.datetime().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createTeamSchema = z.object({
  teamName: z.string().trim().min(1).max(256),
  managerId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateTeamSchema = createTeamSchema.partial();

/**
 * Validate data against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema
 * @param {*} data - Data to validate
 * @returns {*} Validated and transformed data
 * @throws {ValidationError}
 */
export function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Validation failed', details);
    }
    throw error;
  }
}

/**
 * Sanitize object by trimming string values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeStrings(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeStrings(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

