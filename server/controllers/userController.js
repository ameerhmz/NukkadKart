import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get all vendors (optionally filter by isOnline)
// @route   GET /api/users/vendors
// @access  Public (or Private)
const getVendors = asyncHandler(async (req, res) => {
    // For now get all vendors. Later add GeoSpatial query
    const vendors = await User.find({ role: 'vendor', isOnline: true }).select('-password');
    res.json(vendors);
});

// @desc    Get user by ID (for vendor profile)
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update vendor location
// @route   PUT /api/users/location
// @access  Private (Vendor)
const updateLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.location = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
        user.isOnline = true; // Auto set online if updating location

        await user.save();
        res.json({ message: 'Location updated' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { getVendors, getUserById, updateLocation };
