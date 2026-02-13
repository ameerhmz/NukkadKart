import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

const VendorProfile = () => {
    const { id } = useParams(); // Vendor ID
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [requestItem, setRequestItem] = useState('');

    useEffect(() => {
        // Fetch vendor details and products
        fetchVendorDetails();
    }, [id]);

    const fetchVendorDetails = async () => {
        try {
            const { data } = await api.get(`/users/${id}`);
            setVendor(data);

            // TODO: Fetch products for this vendor once endpoint exists
            // const productsData = await api.get(`/products/vendor/${id}`);
            // setProducts(productsData.data);

            // Keeping mock products for now as public product endpoint isn't made yet
            setProducts([
                { _id: 'p1', name: 'Aloo Tikki', price: 40, stock: 10 },
                { _id: 'p2', name: 'Gol Gappe', price: 20, stock: 50 },
            ]);
        } catch (error) {
            console.error('Failed to fetch vendor details', error);
        }
    };

    const handleRequest = async (itemName) => {
        const item = itemName || requestItem;
        if (!item) return;

        try {
            await api.post('/requests', { vendorId: id, items: item });
            alert(`Request sent for ${item}!`);
            setRequestItem('');
        } catch (error) {
            alert('Failed to send request: ' + (error.response?.data?.message || error.message));
        }
    };

    if (!vendor) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Back</button>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <h1 className="text-2xl font-bold">{vendor.name}</h1>
                <p className={`font-semibold ${vendor.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {vendor.isOnline ? '🟢 Live Now' : '🔴 Offline'}
                </p>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Menu</h2>
                <div className="space-y-3">
                    {products.map(product => (
                        <div key={product._id} className="bg-white p-3 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <p className="font-bold">{product.name}</p>
                                <p className="text-gray-600">₹{product.price}</p>
                            </div>
                            <button
                                onClick={() => handleRequest(product.name)}
                                className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Request
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-2">Request Special Item</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={requestItem}
                        onChange={(e) => setRequestItem(e.target.value)}
                        placeholder="e.g. Extra Spicy Pani Puri"
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        onClick={() => handleRequest()}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
