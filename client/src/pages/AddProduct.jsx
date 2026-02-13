import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Html5QrcodeScanner } from 'html5-qrcode';

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        barcode: '',
        costPrice: ''
    });
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isScanning && !scanResult) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);

            return () => {
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            };
        }
    }, [isScanning]);

    const onScanSuccess = (decodedText, decodedResult) => {
        setScanResult(decodedText);
        setFormData(prev => ({ ...prev, barcode: decodedText }));
        setIsScanning(false);
        // TODO: Could fetch product details from public API if barcode matches known items
    };

    const onScanFailure = (error) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', formData);
            navigate('/vendor-dashboard');
        } catch (error) {
            alert('Failed to add product. ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <h1 className="text-xl font-bold mb-4">Add New Product</h1>

            {/* Barcode Scanner Section */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow text-center">
                {isScanning ? (
                    <div id="reader" width="300px"></div>
                ) : (
                    <button
                        onClick={() => setIsScanning(true)}
                        className="bg-purple-600 text-white w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                        Scan Barcode 📷
                    </button>
                )}
                {scanResult && <p className="mt-2 text-green-600 font-mono">Code: {scanResult}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Selling Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Cost Price (Optional)</label>
                        <input
                            type="number"
                            name="costPrice"
                            value={formData.costPrice}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Starts Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Barcode</label>
                        <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg bg-gray-100"
                            placeholder="Manually enter or scan"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg mt-6 shadow-lg hover:bg-blue-700 transition"
                >
                    Save Product
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/vendor-dashboard')}
                    className="w-full bg-transparent text-gray-500 py-3 mt-2"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
