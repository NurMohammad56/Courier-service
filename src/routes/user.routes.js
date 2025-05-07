import express from 'express';
import {
  createShipment,
  getPendingProducts,
  takeProduct,
  scanBarcode,
  submitProduct,
  getProductsToReceive,
  receiveProduct,
  scanBarcodeForReceipt,
  getHistory,
  getProductLocation,
  editProfile,
  changePassword,
} from '../controllers/user.controllers.js';
import { isAuthenticated, restrictTo } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('user'));

router.post('/create-shipment', createShipment);
router.post('/pending-products', getPendingProducts);
router.post('/take-product', takeProduct);
router.post('/scan-barcode', scanBarcode);
router.post('/submit-product', submitProduct);
router.get('/products-to-receive', getProductsToReceive);
router.post('/receive-product', receiveProduct);
router.post('/scan-barcode-receipt', scanBarcodeForReceipt);
router.get('/history', getHistory);
router.get('/location/:productId', getProductLocation);
router.put('/edit-profile', editProfile);
router.put('/change-password', changePassword);

export default router;