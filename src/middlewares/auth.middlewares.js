import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError.js';
import {User} from '../models/user.models.js';

export const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError(401, 'Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError(401, 'User not found'));
        }
        req.user = user;
        next();
    } catch (err) {
        return next(new AppError(401, 'Invalid or expired token'));
    }
};

export const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new AppError(403, 'Access denied'));
    }
    next();
};