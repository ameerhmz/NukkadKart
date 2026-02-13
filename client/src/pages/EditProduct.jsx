import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Package,
    IndianRupee,
    Box,
    Save,
    Trash2,
    AlertCircle
} from 'lucide-react';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        barcode: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setFormData({
                    name: data.name,
                    price: data.price,
                    stock: data.stock,
                    barcode: data.barcode || ''
                });
            } catch (err) {
                setError('Failed to load product details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put(`/products/${id}`, formData);
            navigate('/vendor-dashboard');
        } catch (err) {
            setError('Failed to update product.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                navigate('/vendor-dashboard');
            } catch (err) {
                setError('Failed to delete product.');
            }
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-4 border-nukkad-orange border-t-transparent rounded-full"
            />
        </div>
    );

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans text-nukkad-blue">
            <header className="flex items-center justify-between mb-8 pt-4 px-1">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/vendor-dashboard')}
                        className="p-2 sm:p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">Edit Product</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors active:scale-95"
                >
                    <Trash2 size={24} />
                </button>
            </header>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-[2rem] flex items-center gap-3"
                >
                    <AlertCircle size={20} />
                    <p className="text-[11px] font-black uppercase tracking-tight">{error}</p>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
                        <section>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                <Package size={12} /> Product Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner"
                                required
                            />
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <section>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                    <IndianRupee size={12} /> Price
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner"
                                    required
                                />
                            </section>
                            <section>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                    <Box size={12} /> Stock
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner"
                                    required
                                />
                            </section>
                        </div>

                        <section>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                Barcode
                            </label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner"
                                placeholder="Optional"
                            />
                        </section>
                    </div>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-nukkad-orange text-white py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-nukkad-orange/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? 'Updating...' : <><Save size={18} /> Update Product</>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default EditProduct;
