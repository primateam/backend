/**
 * Custom error classes for standardized error handling
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.id = id;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', field = null) {
    super(message, 409, 'CONFLICT');
    this.field = field;
  }
}

export class ForeignKeyError extends AppError {
  constructor(
    message = 'Referenced resource does not exist',
    constraint = null,
  ) {
    super(message, 400, 'FOREIGN_KEY_VIOLATION');
    this.constraint = constraint;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Helper function to extract PostgreSQL error code from Drizzle ORM errors
 * Drizzle wraps the original pg error, so we need to check multiple places
 * @param {Error} error - The error object from Drizzle
 * @returns {string|null} - PostgreSQL error code or null
 */
export function getPostgresErrorCode(error) {
  // Direct code property
  if (error.code) {
    return error.code;
  }
  // Drizzle wraps the original error in cause
  if (error.cause?.code) {
    return error.cause.code;
  }
  // Some versions wrap it in originalError
  if (error.originalError?.code) {
    return error.originalError.code;
  }
  return null;
}

/**
 * Helper function to extract PostgreSQL constraint name from error
 * @param {Error} error - The error object from Drizzle
 * @returns {string|null} - Constraint name or null
 */
export function getPostgresConstraint(error) {
  if (error.constraint) {
    return error.constraint;
  }
  if (error.cause?.constraint) {
    return error.cause.constraint;
  }
  if (error.originalError?.constraint) {
    return error.originalError.constraint;
  }
  return null;
}

/**
 * Parse a foreign key constraint name to extract the referenced table
 * Convention: {table}_{column}_{referenced_table}_{referenced_column}_fk
 * Example: interaction_customer_id_customer_customer_id_fk -> customer
 * @param {string} constraint - The constraint name
 * @returns {string|null} - The referenced table name or null
 */
export function parseConstraintForTable(constraint) {
  if (!constraint) return null;

  // Match pattern like: interaction_customer_id_customer_customer_id_fk
  // We want to extract the third part which is the referenced table
  const parts = constraint.split('_');

  // Find the pattern: after the column name (ending with 'id'),
  // the next word is the referenced table
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === 'id' && i + 1 < parts.length && parts[i + 1] !== 'fk') {
      return parts[i + 1];
    }
  }

  return null;
}
