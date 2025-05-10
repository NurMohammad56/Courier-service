import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import { Product } from '../models/product.models.js';
import { io } from '../../server.js';


// Get live location with detailed product info
export const getLiveLocation = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        $or: [
            { shipperId: req.user._id },
            { transporterId: req.user._id },
            { receiverId: req.user._id },
        ],
    })
        .populate(
            'fromHubId toHubId shipperId receiverId transporterId',
            'name status coordinates liveCoordinates'
        );

    if (!product) {
        throw new AppError(404, 'Product not found or access denied');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Live location retrieved successfully',
        data: {
            productId: product._id,
            name: product.name,
            status: product.status,
            liveCoordinates: product.liveCoordinates || null,
            fromHub: product.fromHubId,
            toHub: product.toHubId,
            shipper: product.shipperId,
            receiver: product.receiverId,
            transporter: product.transporterId,
            locations: product.locations
        },
    });
});

// Update live coordinates with enhanced validation
export const updateLocation = catchAsync(async (req, res) => {
    const { productId, lat, lng } = req.body;

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new AppError(400, 'Invalid coordinates');
    }

    // First verify the user has access to this product
    const product = await Product.findOne({
        _id: productId,
        $or: [
            { shipperId: req.user._id },
            { transporterId: req.user._id },
            { receiverId: req.user._id }
        ]
    });

    if (!product) {
        throw new AppError(404, 'Product not found or access denied');
    }

    const updateData = {
        liveCoordinates: {
            lat,
            lng,
            timestamp: Date.now(),
            ...(product.transporterId?.equals(req.user._id) && { transporterId: req.user._id })
        }
    };

    // Automatically set status to "On the way" if being updated by the transporter
    if (product.transporterId?.equals(req.user._id)) {
        updateData.status = 'On the way';
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true }
    ).populate('transporterId shipperId receiverId');

    // Broadcast the update to all connected clients
    io.to(productId).emit('locationUpdated', {
        productId,
        coordinates: { lat, lng },
        timestamp: Date.now(),
        updatedBy: {
            _id: req.user._id,
            name: req.user.name,
            role: product.shipperId?.equals(req.user._id) ? 'shipper' :
                product.transporterId?.equals(req.user._id) ? 'transporter' :
                    'receiver'
        },
        status: updatedProduct.status
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Live location updated successfully',
        data: {
            coordinates: updatedProduct.liveCoordinates,
            updatedBy: req.user._id,
            status: updatedProduct.status
        }
    });
});
