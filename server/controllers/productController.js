const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products for logged in vendor
// @route   GET /api/products
// @access  Private (Vendor)
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ vendor: req.user._id });
    res.json(products);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, costPrice, stock, barcode, image } = req.body;

    // Check if product with barcode exists for *this* vendor (optional: or globally unique?)
    // Requirements said "barcode value", usually unique. Schema enforces unique sparse.

    // If barcode is provided, check if it's already used by ANYONE (schema unique)
    if (barcode) {
        const productExists = await Product.findOne({ barcode });
        if (productExists) {
            res.status(400);
            throw new Error('Product with this barcode already exists');
        }
    }

    const product = await Product.create({
        vendor: req.user._id,
        name,
        price,
        costPrice,
        stock,
        barcode,
        image
    });

    if (product) {
        res.status(201).json(product);
    } else {
        res.status(400);
        throw new Error('Invalid product data');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Ensure user owns the product
        if (product.vendor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this product');
        }

        await product.deleteOne(); // or product.remove() in older Mongoose
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, costPrice, stock, barcode, image } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this product');
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
        product.stock = stock !== undefined ? stock : product.stock;
        product.barcode = barcode || product.barcode;
        product.image = image || product.image;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct
};
