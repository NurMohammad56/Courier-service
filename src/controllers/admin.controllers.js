import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import { Hub } from '../models/hubs.models.js';
import { User } from '../models/user.models.js';
import { Product } from '../models/product.models.js';

// Get dashboard overview
export const getDashboardOverview = catchAsync(async (req, res) => {
    const totalHubs = await Hub.countDocuments();
    const totalHubManagers = await User.countDocuments({ role: 'hubManager' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalAmount = (await Product.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]))[0]?.total || 0;

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: { totalHubs, totalHubManagers, totalUsers, totalProducts, totalAmount },
    });
});

// Helper function to paginate and filter users
const fetchUsers = async (req, role) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { role };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ];
    }

    const users = await User.find(query)
        .populate('hubId', 'name')
        .skip(skip)
        .limit(limitNum);

    const total = await User.countDocuments(query);

    return {
        users,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

// Get transporter list
export const getTransporters = catchAsync(async (req, res) => {
    const { users, total, page, limit, totalPages } = await fetchUsers(req, 'transporter');

    const formattedUsers = users.map((user) => ({
        name: user.name,
        departureHub: user.departureHub ? user.departureHub.name : null,
        arrivalHub: user.arrivalHub ? user.arrivalHub.name : null,
        email: user.email,
        phone: user.phone,
        location: user.location || 'N/A',
    }));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transporter list retrieved successfully',
        data: formattedUsers,
        pagination: { total, page, limit, totalPages },
    });
});

// Get hub manager list
export const getHubManagers = catchAsync(async (req, res) => {
    const { users, total, page, limit, totalPages } = await fetchUsers(req, 'hubManager');

    const formattedUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        joiningDate: user.createdAt,
        assignedHub: user.hubId ? user.hubId.name : null,
    }));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Hub manager list retrieved successfully',
        data: formattedUsers,
        pagination: { total, page, limit, totalPages },
    });
});

// Get hub list
export const getHubs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const hubs = await Hub.find(query)
        .populate('managerId', 'name email phone')
        .skip(skip)
        .limit(limitNum);

    const total = await Hub.countDocuments(query);

    const formattedHubs = hubs.map((hub) => ({
        hubName: hub.name,
        assignedManager: hub.managerId ? hub.managerId.name : null,
        assignedDate: hub.createdAt,
        email: hub.managerId ? hub.managerId.email : null,
        phone: hub.managerId ? hub.managerId.phone : null,
    }));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Hub list retrieved successfully',
        data: formattedHubs,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
});

// Add new hub manager
export const addHubManager = catchAsync(async (req, res) => {
    const { username, email, phone, password, confirmPassword, hubId } = req.body;

    if (password !== confirmPassword) {
        throw new AppError(400, 'Passwords do not match');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError(400, 'Email already in use');
    }

    const newUser = await User.create({
        name: username,
        email,
        phone,
        password,
        role: 'hubManager',
        hubId,
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Hub manager added successfully',
        data: newUser,
    });
});

// Add new hub
export const addHub = catchAsync(async (req, res) => {
    const { hubName, coordinates } = req.body;

    const existingHub = await Hub.findOne({ name: hubName });
    if (existingHub) {
        throw new AppError(400, 'Hub name already exists');
    }

    const newHub = await Hub.create({ name: hubName, coordinates });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Hub added successfully',
        data: newHub,
    });
});

export const deleteUser = catchAsync(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    await User.deleteOne({ _id: userId });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
        data: null,
    });
});