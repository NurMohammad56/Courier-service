import express from 'express';
import {
    manageRequest,
    getProfile,
    getShipperRequests,
    getTransportRequests,
    getSubmitProductRequests,
    getReceiverRequests,
} from '../controllers/hubManager.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('hubManager'));

router.get('/profile', getProfile);
router.post('/manage-request', manageRequest);
router.get('/shipper-requests', getShipperRequests);
router.get('/transport-requests', getTransportRequests);
router.get('/submit-product-requests', getSubmitProductRequests);
router.get('/receiver-requests', getReceiverRequests);

export default router;