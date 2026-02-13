import express from 'express';
import {
    createRequest,
    getVendorRequests,
    getCustomerRequests,
    updateRequestStatus
} from '../controllers/requestController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/vendor', protect, vendorOnly, getVendorRequests);
router.get('/customer', protect, getCustomerRequests);
router.put('/:id', protect, vendorOnly, updateRequestStatus);

export default router;
