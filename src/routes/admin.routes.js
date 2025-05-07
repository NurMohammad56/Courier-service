import express from 'express';
import {
  addHubManager,
  addHub,
  getDashboardOverview,
  getAllUsers,
  getAllProducts,
  deleteUser,
} from '../controllers/admin.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('admin'));

router.post('/add-hub-manager', addHubManager);
router.post('/add-hub', addHub);
router.get('/dashboard-overview', getDashboardOverview);
router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.delete('/users/:userId', deleteUser);

export default router;