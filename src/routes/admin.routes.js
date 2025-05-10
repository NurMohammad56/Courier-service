import express from 'express';
import {
    getDashboardOverview,
    getHubManagers,
    getHubs,
    addHubManager,
    addHub,
    getAllTransporters
} from '../controllers/admin.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('admin'));

router.get('/overview', getDashboardOverview);
router.get('/transporters', getAllTransporters);
router.get('/hub-managers', getHubManagers);
router.get('/hubs', getHubs);
router.post('/hub-managers', addHubManager);
router.post('/hubs', addHub);

export default router;