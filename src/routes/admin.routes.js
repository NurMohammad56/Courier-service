import express from 'express';
import {
    getDashboardOverview,
    getTransporters,
    getHubManagers,
    getHubs,
    addHubManager,
    addHub,
} from '../controllers/admin.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('admin'));

router.get('/overview', getDashboardOverview);
router.get('/transporters', getTransporters);
router.get('/hub-managers', getHubManagers);
router.get('/hubs', getHubs);
router.post('/hub-managers', addHubManager);
router.post('/hubs', addHub);

export default router;