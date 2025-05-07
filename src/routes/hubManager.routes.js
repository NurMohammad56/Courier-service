import express from 'express';
import { manageRequest, getPendingRequests, getProfile } from '../controllers/hubManager.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('hubManager'));

router.get('/profile', getProfile);
router.post('/manage-request', manageRequest);
router.get('/pending-requests', getPendingRequests);

export default router;