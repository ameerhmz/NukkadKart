import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number, // Selling Price
        required: true
    },
    costPrice: {
        type: Number,
        required: false // Optional
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    barcode: {
        type: String,
        required: false,
        unique: true,
        sparse: true // Allows multiple null/undefined values, but unique if present
    },
    image: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true,
        default: 'Snacks',
        enum: ['Snacks', 'Drinks', 'Meals', 'Desserts', 'Other']
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
