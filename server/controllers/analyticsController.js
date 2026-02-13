import asyncHandler from 'express-async-handler';

// MOCK DATA for analytics
const mockHeatmap = [
    { lat: 28.6139, lng: 77.2090, weight: 120 }, // Delhi
    { lat: 28.6120, lng: 77.2100, weight: 80 },
    { lat: 28.6150, lng: 77.2080, weight: 200 }
];

// @desc    Get heat map data (sales locations) for the last week
// @route   GET /api/analytics/heatmap
// @access  Private (Vendor)
const getSalesHeatmap = asyncHandler(async (req, res) => {
    res.json(mockHeatmap);
});

// @desc    Get vendor dashboard stats
// @route   GET /api/analytics/stats
// @access  Private (Vendor)
const getVendorStats = asyncHandler(async (req, res) => {
    // In a real app, we'd query the DB. Here we use mocks + some real counts.
    res.json({
        todaySales: 1540,
        activeItems: 15, // Can link this to products count eventually
        pendingRequests: 3
    });
});

export { getSalesHeatmap, getVendorStats };
