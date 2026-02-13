import express from 'express';
import {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductById
} from '../controllers/productController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, vendorOnly, getProducts)
    .post(protect, vendorOnly, createProduct);

router.route('/:id')
    .get(protect, vendorOnly, getProductById)
    .delete(protect, vendorOnly, deleteProduct)
    .put(protect, vendorOnly, updateProduct);

export default router;
