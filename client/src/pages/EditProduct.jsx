import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Package,
    IndianRupee,
    Box,
    Save,
    Trash2,
    AlertCircle,
    ScanBarcode,
    ShoppingCart,
    CheckCircle2
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
                setError('Failed to load product intelligence.');
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
        setError(null);
        try {
            await api.put(`/products/${id}`, formData);
            navigate('/vendor-dashboard');
        } catch (err) {
            setError('Synchronization failed. Check network constants.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Erase this data point from inventory?')) {
            try {
                await api.delete(`/products/${id}`);
                navigate('/vendor-dashboard');
            } catch (err) {
                setError('Decommissioning failed.');
            }
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen premium-bg">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-animated text-white pb-20 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-float" />

            {/* Header */}
            <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-3xl z-30 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/vendor-dashboard')}
                        className="w-14 h-14 glass-ultra rounded-2xl flex items-center justify-center hover:text-primary transition-all border border-white/10 glow-primary"
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic gradient-text leading-none">Modify Asset</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Registry Refinement</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="w-14 h-14 glass-ultra rounded-2xl flex items-center justify-center text-white/20 hover:text-red-500 hover:border-red-500/50 transition-all border border-white/10 active:scale-90 glow-primary"
                >
                    <Trash2 size={24} />
                </button>
            </header>

            <main className="px-6 max-w-2xl mx-auto mt-10">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-dark mb-10 p-6 rounded-3xl border border-red-500/30 flex items-center gap-5 text-red-400 neon-red"
                        >
                            <AlertCircle size={24} />
                            <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="glass-dark p-10 rounded-[4rem] space-y-10 neon-blue">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Designation</label>
                            <div className="relative group">
                                <ShoppingCart className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={24} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                    placeholder="Product Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Valuation</label>
                                <div className="relative group">
                                    <IndianRupee className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={22} />
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Units</label>
                                <div className="relative group">
                                    <Package className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={22} />
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                        placeholder="In Stock"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Grid Signature</label>
                            <div className="relative group">
                                <ScanBarcode className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={24} />
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50 text-white/60"
                                    placeholder="Unique Signature"
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={isSaving}
                        type="submit"
                        className="btn-premium w-full flex items-center justify-center gap-4 !py-6 !rounded-[2.5rem] shadow-primary/20 text-[11px] font-black uppercase tracking-[0.3em]"
                    >
                        {isSaving ? 'Recalibrating...' : <><CheckCircle2 size={24} /> Commit Intelligence</>}
                    </motion.button>
                </form>
            </main>
        </div>
    );
};

export default EditProduct;
