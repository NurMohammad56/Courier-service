import catchAsync from '../utilty/catchAsync.js';
import AppError from '../errors/AppError.js';
import { sendResponse } from '../utilty/helper.utilty.js';
import {Hub} from '../models/hubs.models.js';
import {User} from '../models/user.models.js';
import {Product} from '../models/product.models.js';

// Add new hub manager
export const addHubManager = catchAsync(async (req, res) => {   
  const { name, email, password, hubId } = req.body;

  if (!name || !email || !password || !hubId) {
    throw new AppError(400, 'All fields are required');
  }

  if (await User.findOne({ email })) {
    throw new AppError(400, 'Email already in use');
  }

  if (!(await Hub.findById(hubId))) {
    throw new AppError(404, 'Hub not found');
  }

  const newHubManager = new User({
    name,
    email,
    password,
    role: 'hubManager',
    hubId,
    isVerified: true, 
  });
  await newHubManager.save();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hub manager added successfully',
    data: newHubManager,
  });
});

// Add new hub
export const addHub = catchAsync(async (req, res) => {
  const { name, lat, lng } = req.body;

  if (!name || !lat || !lng) {
    throw new AppError(400, 'All fields are required');
  }

  if (await Hub.findOne({ name })) {
    throw new AppError(400, 'Hub already exists');
  }

  const newHub = new Hub({
    name,
    coordinates: { lat, lng },
  });
  await newHub.save();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hub added successfully',
    data: newHub,
  });
});

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

// Get all users
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password -refreshToken');
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

// Get all products
export const getAllProducts = catchAsync(async (req, res) => {
  const products = await Product.find().populate('fromHubId toHubId shipperId receiverId transporterId');
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products retrieved successfully',
    data: products,
  });
});

// Delete user
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