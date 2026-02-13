import express from 'express';
import {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    lookupProduct,
    processQuickSale,
    getProductsByVendor
} from '../controllers/productController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/lookup/:barcode', protect, vendorOnly, lookupProduct);
router.post('/sell', protect, vendorOnly, processQuickSale);

router.route('/')
    .get(protect, vendorOnly, getProducts)
    .post(protect, vendorOnly, createProduct);

router.route('/:id')
    .get(protect, vendorOnly, getProductById)
    .delete(protect, vendorOnly, deleteProduct)
    .put(protect, vendorOnly, updateProduct);

router.get('/vendor/:vendorId', getProductsByVendor);

export default router;
