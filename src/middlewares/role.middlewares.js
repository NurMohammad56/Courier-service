import AppError from "../errors/AppError";

export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return next(new AppError(401, 'Authentication required'));
  }
  next();
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'Access denied'));
  }
  next();
};