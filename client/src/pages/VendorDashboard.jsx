import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

const VendorDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            setIsLive(parsedUser.isOnline);
            fetchProducts();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const toggleLiveStatus = async () => {
        // Implementation for toggling live status (Phase 4/5 logic, but UI here)
        // For now just local state
        setIsLive(!isLive);
        // TODO: Call API to update status
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Has Nukkad, Ab Digital</h1>
                <button
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        navigate('/login');
                    }}
                    className="text-sm text-red-500"
                >
                    Logout
                </button>
            </header>

            {/* Live Status Toggle */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
                <span className="font-semibold text-lg">{t('status', { defaultValue: 'Your Status' })}</span>
                <button
                    onClick={toggleLiveStatus}
                    className={`px-6 py-2 rounded-full font-bold text-white transition-colors ${isLive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                >
                    {isLive ? 'LIVE' : 'OFFLINE'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500 text-sm">Today's Sales</p>
                    <p className="text-2xl font-bold">₹0</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500 text-sm">Active Items</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                </div>
            </div>

            {/* Inventory Section */}
            <div className="mb-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Inventory</h2>
                    <Link to="/add-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                        + Add Item
                    </Link>
                </div>

                <div className="space-y-3">
                    {products.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No products added yet.</p>
                    ) : (
                        products.map((product) => (
                            <div key={product._id} className="bg-white p-3 rounded-lg shadow flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{product.name}</p>
                                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₹{product.price}</p>
                                    {/* <button className="text-xs text-blue-500 mt-1">Edit</button> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Nav (Placeholder for Phase 4) */}
            <nav className="fixed bottom-0 left-0 w-full bg-white shadow-top border-t border-gray-200 p-3 flex justify-around">
                <span className="text-blue-600 font-semibold">Home</span>
                <span className="text-gray-400">Requests</span>
                <span className="text-gray-400">Profile</span>
            </nav>
        </div>
    );
};

export default VendorDashboard;
