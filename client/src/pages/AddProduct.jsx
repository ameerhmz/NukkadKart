import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ScanBarcode,
    Package,
    IndianRupee,
    Box,
    Save,
    X,
    Camera,
    CheckCircle2,
    Info,
    Sparkles,
    Zap,
    ShoppingCart
} from 'lucide-react';

const mockProductDatabase = {
    "8901491101831": { name: "Lays Classic Salted", price: 20, stock: 50 },
    "8901491101824": { name: "Kurkure Masala Munch", price: 20, stock: 40 },
    "8901058000109": { name: "Maggi Noodles 70g", price: 14, stock: 100 },
    "8901764332207": { name: "Britannia Bourbon", price: 30, stock: 25 },
    "8901030612184": { name: "Red Label Tea 250g", price: 110, stock: 15 },
    "123456789": { name: "Demo Product", price: 99, stock: 10 }
};

const AddProduct = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') || 'manual';

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        barcode: '',
        costPrice: ''
    });
    const [scanResult, setScanResult] = useState(null);
    const [detectedProduct, setDetectedProduct] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        let timer;
        if (isScanning && !scanResult) {
            timer = setTimeout(async () => {
                const element = document.getElementById("reader");
                if (!element) return;
                try {
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                        onScanSuccess,
                        null
                    );
                } catch (err) { console.error(err); }
            }, 500);
        }
        return () => {
            if (timer) clearTimeout(timer);
            if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => { });
        };
    }, [isScanning, scanResult]);

    const onScanSuccess = async (decodedText) => {
        if (isScanning && !scanResult) {
            setScanResult(decodedText);
            setFormData(prev => ({ ...prev, barcode: decodedText }));
            setIsScanning(false);

            // Call API to lookup product
            try {
                const { data } = await api.get(`/products/lookup/${decodedText}`);
                if (data.found) {
                    setDetectedProduct(data);
                }
            } catch (error) {
                console.error("Lookup failed:", error);
            }
        }
    };

    const applyDetectedProduct = () => {
        if (detectedProduct) {
            setFormData(prev => ({
                ...prev,
                name: detectedProduct.name || prev.name,
                price: detectedProduct.price || prev.price,
                // If external, we might not have stock info, keep user's input or default
                stock: prev.stock
            }));
            setDetectedProduct(null);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle manual barcode entry lookup
    const handleBarcodeBlur = async () => {
        if (formData.barcode.length > 3) {
            try {
                const { data } = await api.get(`/products/lookup/${formData.barcode}`);
                if (data.found) {
                    setDetectedProduct(data);
                }
            } catch (error) {
                // Silent fail for manual entry if not found
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/products', formData);
            navigate('/vendor-dashboard');
        } catch (error) {
            alert('Failed to add product');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-animated text-white pb-20 overflow-hidden relative">
            {/* Decorative Blobs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-float" />

            {/* Header */}
            <header className="px-6 pt-10 pb-6 flex items-center gap-6 sticky top-0 bg-black/40 backdrop-blur-3xl z-30 border-b border-white/5">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/vendor-dashboard')}
                    className="w-14 h-14 glass-ultra rounded-2xl flex items-center justify-center hover:text-primary transition-all border border-white/10 glow-primary"
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic gradient-text">Add Asset</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Inventory Initialization</p>
                </div>
            </header>

            <main className="px-6 max-w-2xl mx-auto mt-10">
                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-dark p-10 rounded-[4rem] flex flex-col items-center gap-10 neon-blue"
                        >
                            <div className="w-full aspect-square bg-black rounded-[3rem] overflow-hidden relative border border-white/10">
                                <div id="reader" className="w-full h-full"></div>
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse pointer-events-none" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-black uppercase tracking-tighter italic text-2xl gradient-text">Grid Scanning</h3>
                                <p className="text-[11px] text-white/20 mt-3 uppercase tracking-[0.3em] font-black">Align barcode within targeting matrix</p>
                            </div>
                            <button onClick={() => setIsScanning(false)} className="px-10 py-4 glass-ultra rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Abort Sync</button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* AI Detection Card */}
                            {detectedProduct && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-dark p-8 rounded-[3.5rem] border-success/30 bg-success/5 relative overflow-hidden group neon-green"
                                >
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-success/20 rounded-2xl text-success glow-success"><Sparkles size={20} fill="currentColor" /></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Pattern Identified</span>
                                        </div>
                                        <button onClick={() => setDetectedProduct(null)} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} className="text-white/20" /></button>
                                    </div>
                                    <div className="mb-8 relative z-10">
                                        <h3 className="text-4xl font-black italic tracking-tighter uppercase gradient-text">{detectedProduct.name}</h3>
                                        <p className="text-[11px] font-black text-white/20 mt-3 uppercase tracking-widest bg-white/5 w-fit px-4 py-1.5 rounded-full italic">Market Value: ₹{detectedProduct.price}</p>
                                    </div>
                                    <button
                                        onClick={applyDetectedProduct}
                                        className="w-full bg-white text-black !py-5 !rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all glow-primary"
                                    >
                                        Incorporate Specs <Zap size={16} fill="currentColor" />
                                    </button>
                                </motion.div>
                            )}

                            {/* Main Form */}
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="glass-dark p-10 rounded-[4rem] space-y-8 neon-blue">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Category</label>
                                        <div className="relative group">
                                            <Package className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={22} />
                                            <select
                                                name="category"
                                                value={formData.category || 'Snacks'}
                                                onChange={handleChange}
                                                className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50 appearance-none"
                                            >
                                                <option value="Snacks">Snacks</option>
                                                <option value="Drinks">Drinks</option>
                                                <option value="Meals">Meals</option>
                                                <option value="Desserts">Desserts</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Designation</label>
                                        <div className="relative group">
                                            <ShoppingCart className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={22} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                                placeholder="e.g. ULTRA MASALA"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Valuation</label>
                                            <div className="relative group">
                                                <IndianRupee className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={20} />
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
                                                <Package className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    value={formData.stock}
                                                    onChange={handleChange}
                                                    className="input-premium pl-20 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-4 italic">Grid Signature</label>
                                        <div className="relative group">
                                            <ScanBarcode className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={22} />
                                            <input
                                                type="text"
                                                name="barcode"
                                                value={formData.barcode}
                                                onChange={handleChange}
                                                onBlur={handleBarcodeBlur}
                                                className="input-premium px-20 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                                placeholder="Scan or Type"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsScanning(true)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-ultra hover:bg-primary/20 rounded-2xl flex items-center justify-center text-primary transition-all glow-primary"
                                            >
                                                <Camera size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSaving}
                                    type="submit"
                                    className="btn-premium w-full flex items-center justify-center gap-4 !py-6 !rounded-[2.5rem] shadow-primary/20 text-[11px] font-black uppercase tracking-[0.3em]"
                                >
                                    {isSaving ? 'Synchronizing...' : <><Save size={22} /> Commit Asset</>}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AddProduct;
