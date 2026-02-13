
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const checkVendor = async () => {
    await connectDB();
    const vendor = await User.findOne({ email: 'suhail@gmail.com' });
    console.log("Vendor:", JSON.stringify(vendor, null, 2));
    process.exit();
};

checkVendor();
