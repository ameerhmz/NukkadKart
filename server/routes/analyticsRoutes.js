import express from 'express';
import { getSalesHeatmap, getVendorStats } from '../controllers/analyticsController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/heatmap', protect, vendorOnly, getSalesHeatmap);
router.get('/stats', protect, vendorOnly, getVendorStats);

export default router;
