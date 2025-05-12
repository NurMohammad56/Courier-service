import express from 'express';
import {
  registerStep1,
  registerStep2,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyResetCode
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register-step1', registerStep1);
router.post('/register-step2', registerStep2);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyResetCode);    
router.post('/reset-password', resetPassword);

export default router;