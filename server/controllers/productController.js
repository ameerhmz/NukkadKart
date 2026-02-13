import asyncHandler from 'express-async-handler';

// IN-MEMORY STORAGE (Temporary as requested)
let products = [
    { _id: '1', vendor: 'mock-vendor-id-123', name: 'Samosa', price: 15, stock: 50, barcode: '123456789' },
    { _id: '2', vendor: 'mock-vendor-id-123', name: 'Chai', price: 10, stock: 100, barcode: '987654321' },
    { _id: '3', vendor: 'mock-vendor-id-123', name: 'Bread Pakora', price: 20, stock: 30, barcode: '456123789' },
    { _id: '4', vendor: 'mock-vendor-id-123', name: 'Vada Pav', price: 25, stock: 40, barcode: '789456123' },
    { _id: '5', vendor: 'mock-vendor-id-123', name: 'Lassi', price: 30, stock: 20, barcode: '321654987' }
];

// @desc    Get all products for logged in vendor
// @route   GET /api/products
// @access  Private (Vendor)
const getProducts = asyncHandler(async (req, res) => {
    const vendorProducts = products.filter(p => p.vendor === req.user._id);
    res.json(vendorProducts);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, costPrice, stock, barcode, image } = req.body;

    if (barcode) {
        const productExists = products.find(p => p.barcode === barcode);
        if (productExists) {
            res.status(400);
            throw new Error('Product with this barcode already exists');
        }
    }

    const newProduct = {
        _id: Math.random().toString(36).substr(2, 9),
        vendor: req.user._id,
        name,
        price: Number(price),
        costPrice: Number(costPrice || 0),
        stock: Number(stock),
        barcode,
        image,
        createdAt: new Date()
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
const deleteProduct = asyncHandler(async (req, res) => {
    const initialLength = products.length;
    products = products.filter(p => p._id !== req.params.id || p.vendor !== req.user._id);

    if (products.length < initialLength) {
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found or not authorized');
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, costPrice, stock, barcode, image } = req.body;
    const index = products.findIndex(p => p._id === req.params.id && p.vendor === req.user._id);

    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: name || products[index].name,
            price: price !== undefined ? Number(price) : products[index].price,
            costPrice: costPrice !== undefined ? Number(costPrice) : products[index].costPrice,
            stock: stock !== undefined ? Number(stock) : products[index].stock,
            barcode: barcode || products[index].barcode,
            image: image || products[index].image,
            updatedAt: new Date()
        };
        res.json(products[index]);
    } else {
        res.status(404);
        throw new Error('Product not found or not authorized');
    }
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Private (Vendor)
const getProductById = asyncHandler(async (req, res) => {
    const product = products.find(p => p._id === req.params.id && p.vendor === req.user._id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

export {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductById
};
