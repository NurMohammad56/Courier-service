import express from 'express';
import authRoutes from '../src/routes/auth.routes.js';
import userRoutes from '../src/routes/user.routes.js';
import hubManagerRoutes from '../src/routes/hubManager.routes.js';
import adminRoutes from '../src/routes/admin.routes.js';

const router = express.Router()

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/hub-manager', hubManagerRoutes);
router.use('/admin', adminRoutes);

export default router;