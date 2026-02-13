import User from '../models/User.js';

// @desc    Get all vendors (optionally filter by isOnline)
// @route   GET /api/users/vendors
// @access  Public (or Private)
const getVendors = async (req, res, next) => {
    try {
        const { search, showAll, latitude, longitude } = req.query;
        let query = { role: 'vendor' };

        // By default only show online vendors, unless showAll is true
        if (showAll !== 'true') {
            query.isOnline = true;
        }

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let vendors;

        // If location is provided, we could sort by distance (future implementation)
        // For now just standard find
        vendors = await User.find(query).select('-password').lean();

        // Calculate distance if user location provided (simple calculation for sorting/display)
        if (latitude && longitude) {
            vendors = vendors.map(vendor => {
                if (vendor.location && vendor.location.coordinates) {
                    const dist = getDistanceInKm(
                        latitude, longitude,
                        vendor.location.coordinates[1], vendor.location.coordinates[0]
                    );
                    return { ...vendor, distance: dist.toFixed(1) }; // Distance in km
                }
                return vendor;
            }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }

        res.json(vendors);
    } catch (error) {
        next(error);
    }
};

// Helper to calculate distance
function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// @desc    Get user by ID (for vendor profile)
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update vendor status (online/offline)
// @route   PUT /api/users/status
// @access  Private (Vendor)
const updateStatus = async (req, res, next) => {
    try {
        const { isOnline } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.isOnline = isOnline;
            await user.save();
            res.json({ message: `Vendor is now ${isOnline ? 'Online' : 'Offline'}` });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update vendor location
// @route   PUT /api/users/location
// @access  Private (Vendor)
const updateLocation = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

export { getVendors, getUserById, updateStatus, updateLocation };
