import { validate, paginationSchema, positiveIntSchema } from './validation.js';
import { buildPaginatedResponse } from './response.js';

/**
 * Parse and validate pagination parameters from query string
 * @param {Object} c - Hono context
 * @returns {Object} { limit, offset }
 */
export function parsePaginationParams(c) {
  const limitStr = c.req.query('limit') || '10';
  const offsetStr = c.req.query('offset') || '0';

  return validate(paginationSchema, {
    limit: limitStr,
    offset: offsetStr,
  });
}

/**
 * Parse and validate a positive integer ID from route params
 * @param {Object} c - Hono context
 * @param {string} paramName - Parameter name
 * @returns {number} Validated ID
 */
export function parseIdParam(c, paramName) {
  const idStr = c.req.param(paramName);
  return validate(positiveIntSchema, idStr);
}

/**
 * Parse request body as JSON
 * @param {Object} c - Hono context
 * @returns {Promise<Object>}
 */
export async function parseRequestBody(c) {
  try {
    return await c.req.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Build a paginated database query result
 * @param {Array} data - Query results
 * @param {number} total - Total count from database
 * @param {number} limit - Limit used in query
 * @param {number} offset - Offset used in query
 * @returns {Object} Formatted response with pagination metadata
 */
export function buildPaginationResult(data, total, limit, offset) {
  return buildPaginatedResponse(data, total, limit, offset);
}

/**
 * Parse sorting parameters from query string
 * @param {Object} c - Hono context
 * @param {Array<string>} allowedFields - Allowed fields for sorting
 * @param {string} defaultField - Default sort field
 * @param {string} defaultOrder - Default sort order ('asc' or 'desc')
 * @returns {Object} { field, order }
 */
export function parseSortParams(c, allowedFields = [], defaultField = 'createdAt', defaultOrder = 'desc') {
  const sortStr = c.req.query('sort') || `${defaultField}:${defaultOrder}`;
  const [field, order] = sortStr.split(':');

  const sortField = allowedFields.includes(field) ? field : defaultField;
  const sortOrder = order === 'asc' ? 'asc' : 'desc';

  return { field: sortField, order: sortOrder };
}

/**
 * Parse filter parameters from query string
 * @param {Object} c - Hono context
 * @param {Array<string>} allowedFields - Allowed fields for filtering
 * @returns {Object} Filter object
 */
export function parseFilterParams(c, allowedFields = []) {
  const filters = {};

  for (const field of allowedFields) {
    const value = c.req.query(field);
    if (value !== undefined && value !== null && value !== '') {
      filters[field] = value;
    }
  }

  return filters;
}

