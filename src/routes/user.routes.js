import express from 'express';
import {
  createShipment,
  requestPrint,
  getPendingProducts,
  scanBarcodeAndTakeProduct,
  submitProduct,
  getProductsToReceive,
  receiveAndScanProduct,
  getHistory,
  editProfile,
  getProfile,
  changePassword,
} from '../controllers/user.controllers.js';
import { updateLocation, getLiveLocation} from '../controllers/location.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';
import upload from '../middlewares/multer.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('user'));

router.post('/create-shipment', createShipment);
router.post('/request-print', requestPrint);
router.get('/pending-products', getPendingProducts);
router.post('/scan-barcode', scanBarcodeAndTakeProduct);
router.post('/submit-product', submitProduct);
router.get('/products-to-receive', getProductsToReceive);
router.post('/scan-barcode-receipt', receiveAndScanProduct);
router.get('/history', getHistory);
router.patch('/update-location', updateLocation);
router.get('/live-location/:productId', getLiveLocation);
router.get('/profile', getProfile);
router.put('/edit-profile', upload.single('image'),editProfile);
router.post('/change-password', changePassword);

export default router;