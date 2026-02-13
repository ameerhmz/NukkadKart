import Product from '../models/Product.js';

// @desc    Get all products for logged in vendor
// @route   GET /api/products
// @access  Private (Vendor)
const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ vendor: req.user._id });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = async (req, res, next) => {
    try {
        const { name, price, costPrice, stock, barcode, image, category } = req.body;

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
            image,
            category
        });

        if (product) {
            res.status(201).json(product);
        } else {
            res.status(400);
            throw new Error('Invalid product data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.vendor.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to delete this product');
            }

            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
const updateProduct = async (req, res, next) => {
    try {
        const { name, price, costPrice, stock, barcode, image } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.vendor.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to update this product');
            }

            product.name = name || product.name;
            product.price = price !== undefined ? price : product.price;
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
    } catch (error) {
        next(error);
    }
};

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Private (Vendor)
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.vendor.toString() !== req.user._id.toString()) {
                // Check authorization if needed
            }
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get products by Vendor ID (Public)
// @route   GET /api/products/vendor/:vendorId
// @access  Public
const getProductsByVendor = async (req, res, next) => {
    try {
        const products = await Product.find({ vendor: req.params.vendorId });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Lookup product by barcode (Internal DB + External API)
// @route   GET /api/products/lookup/:barcode
// @access  Private (Vendor)
const lookupProduct = async (req, res, next) => {
    try {
        const { barcode } = req.params;
        const productDetails = await lookupBarcode(barcode);

        if (productDetails) {
            res.json({ found: true, ...productDetails });
        } else {
            res.status(404).json({ found: false, message: 'Product not found via external APIs' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Process a Quick Sale (POS Mode)
// @route   POST /api/products/sell
// @access  Private (Vendor)
const processQuickSale = async (req, res, next) => {
    try {
        const { barcode, productId, quantity = 1 } = req.body;

        // Find product by ID or Barcode AND Vendor
        let product;
        if (productId) {
            product = await Product.findOne({ _id: productId, vendor: req.user._id });
        } else if (barcode) {
            product = await Product.findOne({ barcode, vendor: req.user._id });
        }

        if (!product) {
            res.status(404);
            throw new Error('Product not found in your inventory');
        }

        if (product.stock < quantity) {
            res.status(400);
            throw new Error(`Insufficient stock. Available: ${product.stock}`);
        }

        // Deduct stock
        product.stock -= quantity;
        await product.save();

        // Record sale (In a real app, create an Order/Transaction record here)
        // For now, we just return success and the updated product

        res.json({
            success: true,
            product: {
                name: product.name,
                price: product.price,
                newStock: product.stock
            },
            totalAmount: product.price * quantity
        });

    } catch (error) {
        next(error);
    }
};

export {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    lookupProduct,
    processQuickSale,
    getProductsByVendor
};

import { lookupBarcode } from '../utils/barcodeService.js';
