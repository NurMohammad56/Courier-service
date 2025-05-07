import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import { Request } from '../models/request.models.js';
import { User } from '../models/user.models.js';

// Approve or reject a request
export const manageRequest = catchAsync(async (req, res) => {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
        throw new AppError(400, 'Request ID and action are required');
    }

    const request = await Request.findById(requestId).populate({
        path: 'productId',
        populate: { path: 'fromHubId toHubId' },
    });

    if (!request || request.status !== 'Pending Approval') {
        throw new AppError(404, 'Request not found or already processed');
    }

    const product = request.productId;
    const hubIdToCheck = request.type === 'pickup' || request.type === 'print' ? product.fromHubId._id : product.toHubId._id;
    if (req.user.hubId.toString() !== hubIdToCheck.toString()) {
        throw new AppError(403, 'You are not authorized to manage this request');
    }

    if (action === 'approve') {
        if (request.type === 'print') {
            // No status change, just allow barcode generation
            request.status = 'Approved';
        } else if (request.type === 'pickup') {
            product.transporterId = request.userId;
            product.status = 'Assigned';
            request.status = 'Approved';
        } else if (request.type === 'scan') {
            product.status = 'On the way';
            product.locations.push({ hubId: product.fromHubId });
            request.status = 'Approved';

            const transporter = await User.findById(request.userId);
            transporter.totalProductsTransported += 1;
            transporter.totalAmountTransported += product.amount;
            await transporter.save();
        } else if (request.type === 'delivery') {
            product.status = 'Reached';
            product.locations.push({ hubId: product.toHubId });
            request.status = 'Approved';

            const transporter = await User.findById(request.userId);
            transporter.totalProductsTransported += 1;
            transporter.totalAmountTransported += product.amount;
            await transporter.save();
        } else if (request.type === 'receive') {
            product.status = 'Pending Receipt Approval';
            request.status = 'Approved';
        } else if (request.type === 'receive-scan') {
            product.status = 'Received';
            request.status = 'Approved';

            const receiver = await User.findById(request.userId);
            receiver.totalProductsReceived += 1;
            receiver.totalAmountReceived += product.amount;
            await receiver.save();
        }
    } else if (action === 'reject') {
        request.status = 'Rejected';
        if (request.type === 'print') {
            // Optionally delete the product or mark it as canceled
            product.status = 'Canceled';
            await product.save();
        }
    } else {
        throw new AppError(400, 'Invalid action');
    }

    await product.save();
    await request.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Request ${action}ed successfully`,
        data: request,
    });
});

// Get pending requests for hub manager
export const getPendingRequests = catchAsync(async (req, res) => {
    const pendingRequests = await Request.find({
        status: 'Pending Approval',
    })
        .populate({
            path: 'productId',
            populate: { path: 'fromHubId toHubId' },
        })
        .populate('userId');

    const filteredRequests = pendingRequests.filter((request) => {
        const product = request.productId;
        const hubIdToCheck = ['pickup', 'print'].includes(request.type) ? product.fromHubId._id : product.toHubId._id;
        return hubIdToCheck.toString() === req.user.hubId.toString();
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Pending requests retrieved successfully',
        data: filteredRequests,
    });
});