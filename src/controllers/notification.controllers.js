import catchAsync from '../utilty/catchAsync.js';
import { Notification } from '../models/notification.models.js';
import { sendResponse } from '../utilty/helper.utilty.js';

export const getUserNotifications = catchAsync(async (req, res) => {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const unreadCount = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
            notifications,
            unreadCount
        }
    });
});

export const markNotificationAsRead = catchAsync(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new AppError(404, 'Notification not found');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notification marked as read',
        data: notification
    });
});

export const markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'All notifications marked as read',
        data: null
    });
});