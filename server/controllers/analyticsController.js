import Product from '../models/Product.js';

// MOCK DATA for analytics
const mockHeatmap = [
    { lat: 28.6139, lng: 77.2090, weight: 120 }, // Delhi
    { lat: 28.6120, lng: 77.2100, weight: 80 },
    { lat: 28.6150, lng: 77.2080, weight: 200 },
    { lat: 26.8467, lng: 80.9462, weight: 150 }, // Lucknow Main
    { lat: 26.8500, lng: 80.9400, weight: 100 },
    { lat: 26.8400, lng: 80.9500, weight: 180 },
    { lat: 26.8450, lng: 80.9450, weight: 90 }
];

// @desc    Get heat map data (sales locations) for the last week
// @route   GET /api/analytics/heatmap
// @access  Private (Vendor)
const getSalesHeatmap = async (req, res, next) => {
    try {
        res.json(mockHeatmap);
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/analytics/stats
// @access  Private (Vendor)
const getVendorStats = async (req, res, next) => {
    try {
        const productCount = await Product.countDocuments({ vendor: req.user._id });

        // In a real app, we'd query orders for sales. Here we use mock sales + real counts.
        res.json({
            todaySales: 1540,
            activeItems: productCount,
            pendingRequests: 3
        });
    } catch (error) {
        next(error);
    }
};

export { getSalesHeatmap, getVendorStats };
