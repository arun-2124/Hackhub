/**
 * Standardized API Response Helpers
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'An error occurred', error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV !== 'production') {
    response.error = typeof error === 'string' ? error : (error.message || error);
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
