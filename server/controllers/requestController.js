import { getIO } from '../socket.js';
import User from '../models/User.js';
// We need to import Request model too, but it seems missing in the original imports or was a typo in the file.
// Assuming it's in ../models/Request.js
import Request from '../models/Request.js';

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (Customer)
const createRequest = async (req, res, next) => {
    try {
        const { vendorId, items } = req.body;

        // Fetch vendor to get current location
        const vendor = await User.findById(vendorId);

        const request = await Request.create({
            customer: req.user._id,
            vendor: vendorId,
            items,
            location: vendor?.location // Snapshot location
        });

        if (request) {
            // Emit real-time notification to the vendor
            try {
                const io = getIO();
                const fullRequest = await Request.findById(request._id).populate('customer', 'name');
                io.to(vendorId).emit('newRequest', fullRequest);
            } catch (error) {
                console.error("Socket emit failed", error);
            }

            res.status(201).json(request);
        } else {
            res.status(400);
            throw new Error('Invalid request data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get requests for logged in vendor
// @route   GET /api/requests/vendor
// @access  Private (Vendor)
const getVendorRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ vendor: req.user._id })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get requests for logged in customer
// @route   GET /api/requests/customer
// @access  Private (Customer)
const getCustomerRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ customer: req.user._id })
            .populate('vendor', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private (Vendor)
const updateRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const request = await Request.findById(req.params.id);

        if (request) {
            if (request.vendor.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized');
            }

            request.status = status;
            const updatedRequest = await request.save();
            res.json(updatedRequest);
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

export {
    createRequest,
    getVendorRequests,
    getCustomerRequests,
    updateRequestStatus
};
