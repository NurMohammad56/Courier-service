import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import {Product} from '../models/product.models.js';
import { io } from '../../server.js'; 

// Update transporter location
export const updateLocation = catchAsync(async (req, res) => {
    const { productId, lat, lng } = req.body;

    if (!productId || !lat || !lng) {
        throw new AppError(400, 'Product ID, latitude, and longitude are required');
    }

    const product = await Product.findOne({ _id: productId, transporterId: req.user._id, status: 'On the way' });
    if (!product) {
        throw new AppError(404, 'Product not found or you are not authorized to update its location');
    }

    product.liveCoordinates = { lat, lng };
    await product.save();

    // Emit the updated location to all clients in the product room
    io.to(productId.toString()).emit('locationUpdate', {
        productId,
        coordinates: { lat, lng },
        timestamp: new Date(),
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Location updated successfully',
        data: { lat, lng },
    });
});

// Get live location (for polling or initial load)
export const getLiveLocation = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        $or: [
            { shipperId: req.user._id },
            { transporterId: req.user._id },
            { receiverId: req.user._id },
        ],
    }).populate('fromHubId toHubId');

    if (!product) {
        throw new AppError(404, 'Product not found or access denied');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Live location retrieved successfully',
        data: {
            productId: product._id,
            coordinates: product.liveCoordinates || { lat: null, lng: null },
            status: product.status,
            fromHub: product.fromHubId,
            toHub: product.toHubId,
        },
    });
});