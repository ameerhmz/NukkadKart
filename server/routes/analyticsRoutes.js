import express from 'express';
import { getSalesHeatmap } from '../controllers/analyticsController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/heatmap', protect, vendorOnly, getSalesHeatmap);

export default router;
