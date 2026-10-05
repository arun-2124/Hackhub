const multer = require('multer');
const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  // Handle Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'File size exceeds the 10 MB limit.');
    }
    return errorResponse(res, 400, `File upload error: ${err.message}`);
  }

  // Handle custom upload filter errors
  if (err.message && err.message.includes('Invalid file type')) {
    return errorResponse(res, 400, err.message);
  }

  // Handle MySQL duplicate key entry (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 409, 'Duplicate entry error: A record with this unique identifier already exists.');
  }

  // Handle MySQL check constraint violation (ER_CHECK_CONSTRAINT_VIOLATED)
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return errorResponse(res, 400, 'Database integrity check violated: Provided values violate constraint rules.');
  }

  // Handle MySQL foreign key constraint failure (ER_NO_REFERENCED_ROW_2)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return errorResponse(res, 400, 'Foreign key constraint error: Referenced entity does not exist or has active dependents.');
  }

  // Default fallback for unexpected errors
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return errorResponse(res, status, message, err);
};

module.exports = errorHandler;
