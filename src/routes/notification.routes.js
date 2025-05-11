import express from 'express';
import {getUserNotifications, markAllAsRead, markNotificationAsRead} from '../controllers/notification.controllers.js'
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('user'));

router.get('/', getUserNotifications);
router.patch('/:notificationId/read', markNotificationAsRead);
router.patch('/mark-all-as-read', markAllAsRead);

export default router;