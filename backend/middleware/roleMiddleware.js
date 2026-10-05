const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-Based Authorization Middleware (RBAC)
 * @param  {...string} allowedRoles - Array of roles permitted (e.g., 'ADMIN', 'ORGANIZER')
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized: User is not authenticated.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access forbidden: Requires one of [${allowedRoles.join(', ')}] role(s). Your role is ${req.user.role}.`
      );
    }

    next();
  };
};

module.exports = {
  checkRole
};
