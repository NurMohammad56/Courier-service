import express from 'express';
import {
    getDashboardOverview,
    getHubManagers,
    getHubs,
    addHubManager,
    addHub,
    getAllTransporters,
    editHubManager,
    deleteUser,
    getTopReciverHubCount,
    getTopHubStats,
    getMonthlyDeliveredProducts
} from '../controllers/admin.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('admin'));

router.get('/overview', getDashboardOverview);
router.get('/transporters', getAllTransporters);
router.get('/hub-managers', getHubManagers);
router.get('/hubs', getHubs);
router.post('/add-managers', addHubManager);
router.patch('/edit-manager/:userId', editHubManager);
router.delete('/delete-manager/:userId', deleteUser);
router.post('/hubs', addHub);
router.get('/top-receiver-hub-count', getTopReciverHubCount);
router.get('/top-hub-stats', getTopHubStats);
router.get('/monthly-delivered-products', getMonthlyDeliveredProducts);

export default router;