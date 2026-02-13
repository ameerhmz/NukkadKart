import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import AddProduct from './pages/AddProduct';
import CustomerMap from './pages/CustomerMap';
import VendorProfile from './pages/VendorProfile';
import VendorHeatmap from './pages/VendorHeatmap';
import QuickSale from './pages/QuickSale';
import EditProduct from './pages/EditProduct';
import Wishlist from './pages/Wishlist';
import './i18n';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/customer-map" element={<CustomerMap />} />
        <Route path="/vendor/heatmap" element={<VendorHeatmap />} />
        <Route path="/vendor/:id" element={<VendorProfile />} />
        <Route path="/quick-sale" element={<QuickSale />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </Router>
  );
}

export default App;
