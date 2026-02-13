import express from 'express';
import { getVendors, getUserById, updateLocation } from '../controllers/userController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/vendors', getVendors);
router.put('/location', protect, vendorOnly, updateLocation);
router.get('/:id', getUserById);

export default router;
