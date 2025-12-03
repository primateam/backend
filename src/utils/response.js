/**
 * Send a successful response
 * @param {Object} c - Hono context
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Response}
 */
export function sendSuccess(c, data = null, statusCode = 200) {
  c.set('idempotencyResponseData', {
    success: true,
    data,
  });
  c.set('idempotencyResponseStatusCode', statusCode);

  return c.json(
    {
      success: true,
      data,
    },
    statusCode
  );
}

/**
 * Send an error response
 * @param {Object} c - Hono context
 * @param {Error} error - Error object
 * @returns {Response}
 */
export function sendError(c, error) {
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_ERROR';

  const response = {
    success: false,
    error: {
      code: errorCode,
      message: error.message,
    },
  };

  if (error.details) {
    response.error.details = error.details;
  }

  return c.json(response, statusCode);
}

/**
 * Build paginated response data
 * @param {Array} data - Array of items
 * @param {number} total - Total count
 * @param {number} limit - Items per page
 * @param {number} offset - Offset/skip
 * @returns {Object}
 */
export function buildPaginatedResponse(data, total, limit, offset) {
  return {
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total,
    },
  };
}

