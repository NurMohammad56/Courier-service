import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import {Product} from '../models/product.models.js';
import { io } from '../../server.js'; 


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

// Update live coordinates (used by transporter app)
export const updateLocation = catchAsync(async (req, res) => {
    const { productId, lat, lng} = req.body;

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new AppError(400, 'Invalid coordinates');
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        {
            liveCoordinates: {
                lat,
                lng,
                timestamp: Date.now(),
                transporterId: req.user._id,
            }
        },
        { new: true }
    );

    if (!product) {
        throw new AppError(404, 'Product not found');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Live location updated',
        data: product.liveCoordinates
    });
});

// Add location history (used when product reaches a hub)
export const addLocationHistory = catchAsync(async (req, res) => {
    const { productId, hubId, action, notes } = req.body;

    const product = await Product.findByIdAndUpdate(
        productId,
        {
            $push: {
                locations: {
                    hubId,
                    userId: req.user._id,
                    action,
                    notes,
                    coordinates: req.hub.coordinates // assuming hub middleware
                }
            }
        },
        { new: true }
    );

    if (!product) {
        throw new AppError(404, 'Product not found');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Location history added',
        data: product.locations
    });
});