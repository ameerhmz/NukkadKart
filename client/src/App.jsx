import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import AddProduct from './pages/AddProduct';
import CustomerMap from './pages/CustomerMap';
import VendorProfile from './pages/VendorProfile';
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
        <Route path="/vendor/:id" element={<VendorProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
