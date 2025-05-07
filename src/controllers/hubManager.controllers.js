import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import { Request } from '../models/request.models.js';
import { User } from '../models/user.models.js';
import { Product } from '../models/product.models.js';

// Get hub manager profile (name and assigned hub)
export const getProfile = catchAsync(async (req, res) => {
    const hubManager = await User.findById(req.user._id).populate('hubId');
    if (!hubManager) {
        throw new AppError(404, 'Hub manager not found');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Profile retrieved successfully',
        data: {
            name: hubManager.name,
            hubName: hubManager.hubId.name,
        },
    });
});

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
    const hubIdToCheck =
        request.type === 'pickup' || request.type === 'print'
            ? product.fromHubId._id
            : product.toHubId._id;

    if (req.user.hubId.toString() !== hubIdToCheck.toString()) {
        throw new AppError(403, 'You are not authorized to manage this request');
    }

    if (action === 'approve') {
        if (request.type === 'print') {
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

        request.isAccepted = true;
    } else if (action === 'reject') {
        request.status = 'Rejected';
        request.isAccepted = false;

        if (request.type === 'print') {
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

// Helper function to filter and paginate requests
const fetchRequests = async (req, types) => {
    const { page = 1, limit = 10, search = '', fromDate, toDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {
        status: 'Pending Approval',
        type: { $in: types },
    };

    // Date range filter
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const requests = await Request.find(query)
        .populate({
            path: 'productId',
            populate: [
                { path: 'fromHubId' },
                { path: 'toHubId' },
                { path: 'shipperId', select: 'name' },
                { path: 'receiverId', select: 'name' },
            ],
        })
        .populate('userId');

    // Filter requests for the hub manager's hub
    let filteredRequests = requests.filter((request) => {
        const product = request.productId;
        const hubIdToCheck = types.includes('pickup') || types.includes('print') ? product.fromHubId._id : product.toHubId._id;
        return hubIdToCheck.toString() === req.user.hubId.toString();
    });

    // Search filter (product code, shipper name, receiver name)
    if (search) {
        filteredRequests = filteredRequests.filter((request) => {
            const product = request.productId;
            return (
                product.uniqueCode.toString().includes(search) ||
                product.shipperId.name.toLowerCase().includes(search.toLowerCase()) ||
                product.receiverId.name.toLowerCase().includes(search.toLowerCase())
            );
        });
    }

    const total = filteredRequests.length;
    const paginatedRequests = filteredRequests.slice(skip, skip + limitNum);

    const formattedRequests = paginatedRequests.map((request) => ({
        requestId: request._id,
        productCode: request.productId.uniqueCode,
        shipperName: request.productId.shipperId.name,
        receiverName: request.productId.receiverId.name,
        fromHub: request.productId.fromHubId.name,
        toHub: request.productId.toHubId.name,
        type: request.type,
        createdAt: request.createdAt,
    }));

    return {
        requests: formattedRequests,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

// Controller for Shipper Requests (type: 'print')
export const getShipperRequests = catchAsync(async (req, res) => {
    const { requests, total, page, limit, totalPages } = await fetchRequests(req, ['print']);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Shipper requests retrieved successfully',
        data: requests,
        pagination: { total, page, limit, totalPages },
    });
});

// Controller for Transport Requests (type: 'pickup', 'scan')
export const getTransportRequests = catchAsync(async (req, res) => {
    const { requests, total, page, limit, totalPages } = await fetchRequests(req, ['pickup', 'scan']);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transport requests retrieved successfully',
        data: requests,
        pagination: { total, page, limit, totalPages },
    });
});

// Controller for Submit Product Requests (type: 'delivery')
export const getSubmitProductRequests = catchAsync(async (req, res) => {
    const { requests, total, page, limit, totalPages } = await fetchRequests(req, ['delivery']);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Submit product requests retrieved successfully',
        data: requests,
        pagination: { total, page, limit, totalPages },
    });
});

// Controller for Receiver Requests (type: 'receive', 'receive-scan')
export const getReceiverRequests = catchAsync(async (req, res) => {
    const { requests, total, page, limit, totalPages } = await fetchRequests(req, ['receive', 'receive-scan']);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Receiver requests retrieved successfully',
        data: requests,
        pagination: { total, page, limit, totalPages },
    });
});