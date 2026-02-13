import asyncHandler from 'express-async-handler';
import Request from '../models/Request.js';

// @desc    Get heat map data (sales locations) for the last week
// @route   GET /api/analytics/heatmap
// @access  Private (Vendor)
const getSalesHeatmap = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // We want to find all requests for this vendor created in the last 7 days
    // that have location data.
    // We could return raw points, or aggregate them if volume is huge.
    // For now, raw points are fine for the heatmap layer to handle.

    const requests = await Request.find({
        vendor: req.user._id,
        createdAt: { $gte: sevenDaysAgo },
        'location.coordinates': { $exists: true, $ne: [] }
    }).select('location createdAt totalAmount');

    // Format for frontend: { lat, lng, weight }
    // Weight could be totalAmount or just 1 (frequency)
    const heatmapData = requests.map(req => ({
        lat: req.location.coordinates[1],
        lng: req.location.coordinates[0],
        weight: req.totalAmount || 1
    }));

    res.json(heatmapData);
});

export { getSalesHeatmap };
