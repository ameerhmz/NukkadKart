const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct
} = require('../controllers/productController');
const { protect, vendorOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, vendorOnly, getProducts)
    .post(protect, vendorOnly, createProduct);

router.route('/:id')
    .delete(protect, vendorOnly, deleteProduct)
    .put(protect, vendorOnly, updateProduct);

module.exports = router;
