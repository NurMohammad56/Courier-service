import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse, generateUniqueCode, calculateDistance, calculateAmount } from '../utilty/helper.utilty.js';
import { Hub } from '../models/hubs.models.js';
import { User } from '../models/user.models.js';
import { Product } from '../models/product.models.js';
import { Request } from '../models/request.models.js';

// Create a new shipment (User acting as shipper)
export const createShipment = catchAsync(async (req, res) => {
    const { fromHubId, toHubId, date, packageName, description, weight, measurement, receiverId } = req.body;

    if (!fromHubId || !toHubId || !date || !packageName || !weight || !measurement || !receiverId) {
        throw new AppError(400, 'All fields are required');
    }

    const fromHub = await Hub.findById(fromHubId);
    const toHub = await Hub.findById(toHubId);
    if (!fromHub || !toHub) {
        throw new AppError(404, 'Hub not found');
    }

    const receiver = await User.findOne({ _id: receiverId, role: 'user' });
    if (!receiver) {
        throw new AppError(404, 'Receiver not found');
    }

    const uniqueCode = await generateUniqueCode();
    const distance = calculateDistance(fromHub.coordinates, toHub.coordinates);
    const amount = calculateAmount(weight, distance);

    const product = new Product({
        uniqueCode,
        name: packageName,
        description,
        weight,
        measurement,
        fromHubId,
        toHubId,
        shipperId: req.user._id,
        receiverId,
        amount,
    });

    await product.save();

    const shipper = await User.findById(req.user._id);
    shipper.totalProductsShipped += 1;
    shipper.totalAmountShipped += amount;
    await shipper.save();

    // Create a request for hub manager to approve printing
    const request = new Request({
        productId: product._id,
        userId: req.user._id,
        type: 'print',
    });
    await request.save();

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Shipment created successfully. Awaiting hub manager approval to generate the barcode.',
        data: {
            uniqueCode,
            product,
            requestId: request._id,
        },
    });
});

// Get pending products for a hub (User acting as transporter)
export const getPendingProducts = catchAsync(async (req, res) => {
    const { fromHubId, toHubId } = req.body;

    if (!fromHubId || !toHubId) {
        throw new AppError(400, 'From and To hubs are required');
    }

    const pendingProducts = await Product.find({
        fromHubId,
        toHubId,
        status: 'Pending',
    }).populate('fromHubId toHubId shipperId receiverId');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Pending products retrieved successfully',
        data: pendingProducts,
    });
});

// Request to take a product (User acting as transporter)
export const takeProduct = catchAsync(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        throw new AppError(400, 'Product ID is required');
    }

    const product = await Product.findOne({ _id: productId, status: 'Pending' });
    if (!product) {
        throw new AppError(404, 'Product not found or already taken');
    }

    const request = new Request({
        productId,
        userId: req.user._id,
        type: 'pickup',
    });
    await request.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Request sent to hub manager',
        data: request,
    });
});

// Scan barcode (User acting as transporter)
export const scanBarcode = catchAsync(async (req, res) => {
    const { productId, scannedCode } = req.body;

    if (!productId || !scannedCode) {
        throw new AppError(400, 'Product ID and scanned code are required');
    }

    const product = await Product.findOne({ _id: productId, transporterId: req.user._id });
    if (!product) {
        throw new AppError(404, 'Product not found or not assigned to you');
    }

    if (product.uniqueCode !== parseInt(scannedCode)) {
        throw new AppError(400, 'Invalid barcode');
    }

    product.status = 'In Transit';
    await product.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Barcode scanned successfully. Product is now in transit.',
        data: { product },
    });
});

// Submit product to destination hub (User acting as transporter)
export const submitProduct = catchAsync(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        throw new AppError(400, 'Product ID is required');
    }

    const product = await Product.findOne({ _id: productId, transporterId: req.user._id });
    if (!product) {
        throw new AppError(404, 'Product not found or not assigned to you');
    }

    const request = new Request({
        productId,
        userId: req.user._id,
        type: 'delivery',
    });
    await request.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Submit request sent to hub manager',
        data: request,
    });
});

// Get products to receive (User acting as receiver)
export const getProductsToReceive = catchAsync(async (req, res) => {
    const reachedProducts = await Product.find({
        receiverId: req.user._id,
        status: 'Reached',
    }).populate('fromHubId toHubId shipperId');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Products to receive retrieved successfully',
        data: reachedProducts,
    });
});

// Request to receive a product (User acting as receiver)
export const receiveProduct = catchAsync(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        throw new AppError(400, 'Product ID is required');
    }

    const product = await Product.findOne({ _id: productId, receiverId: req.user._id, status: 'Reached' });
    if (!product) {
        throw new AppError(404, 'Product not found or not ready to receive');
    }

    const request = new Request({
        productId,
        userId: req.user._id,
        type: 'receive',
    });
    await request.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Receive request sent to hub manager',
        data: request,
    });
});

// Scan barcode to confirm receipt (User acting as receiver)
export const scanBarcodeForReceipt = catchAsync(async (req, res) => {
    const { productId, scannedCode } = req.body;

    if (!productId || !scannedCode) {
        throw new AppError(400, 'Product ID and scanned code are required');
    }

    const product = await Product.findOne({ _id: productId, receiverId: req.user._id });
    if (!product) {
        throw new AppError(404, 'Product not found or not assigned to you');
    }

    if (product.uniqueCode !== parseInt(scannedCode)) {
        throw new AppError(400, 'Invalid barcode');
    }

    product.status = 'Received';
    await product.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Barcode scanned successfully. Product marked as received.',
        data: { product },
    });
});

// Get user history (Shipper, Transporter, Receiver history)
export const getHistory = catchAsync(async (req, res) => {
    const shipped = await Product.find({ shipperId: req.user._id }).populate('fromHubId toHubId');
    const transported = await Product.find({ transporterId: req.user._id }).populate('fromHubId toHubId');
    const received = await Product.find({ receiverId: req.user._id }).populate('fromHubId toHubId');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User history retrieved successfully',
        data: { shipped, transported, received },
    });
});

// Get live location of a product
export const getProductLocation = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        $or: [
            { shipperId: req.user._id },
            { transporterId: req.user._id },
            { receiverId: req.user._id },
        ],
    }).populate('fromHubId toHubId locations.hubId');

    if (!product) {
        throw new AppError(404, 'Product not found or access denied');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product location retrieved successfully',
        data: { product, locations: product.locations },
    });
});

// Edit Profile
export const editProfile = catchAsync(async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        throw new AppError(400, 'Name and email are required');
    }

    const user = await User.findById(req.user._id);
    if (await User.findOne({ email, _id: { $ne: req.user._id } })) {
        throw new AppError(400, 'Email already in use');
    }

    user.name = name;
    user.email = email;
    await user.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});

// Change Password
export const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new AppError(400, 'All fields are required');
    }

    if (newPassword !== confirmPassword) {
        throw new AppError(400, 'New password and confirmation do not match');
    }

    const user = await User.findById(req.user._id);
    if (!(await user.isPasswordValid(currentPassword))) {
        throw new AppError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Password changed successfully',
        data: null,
    });
});