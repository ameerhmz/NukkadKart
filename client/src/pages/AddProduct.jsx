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
    Zap
} from 'lucide-react';

// Common snack barcodes for demonstration
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
                    // Switch to Html5Qrcode for more granular control
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;

                    const config = {
                        fps: 15,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    };

                    await html5QrCode.start(
                        { facingMode: "environment" }, // Prefer back camera
                        config,
                        onScanSuccess,
                        onScanFailure
                    );
                } catch (err) {
                    console.error("Scanner start error:", err);
                    // alert("Could not start camera. Please check permissions.");
                }
            }, 500); // 500ms for smoother animation completion
        }

        return () => {
            if (timer) clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Scanner stop error", err));
            }
        };
    }, [isScanning, scanResult]);

    const onScanSuccess = (decodedText, decodedResult) => {
        setScanResult(decodedText);
        setFormData(prev => ({ ...prev, barcode: decodedText }));
        setIsScanning(false);

        // Lookup in mock database
        if (mockProductDatabase[decodedText]) {
            setDetectedProduct(mockProductDatabase[decodedText]);
        }
    };

    const applyDetectedProduct = () => {
        if (detectedProduct) {
            setFormData(prev => ({
                ...prev,
                name: detectedProduct.name,
                price: detectedProduct.price,
                stock: detectedProduct.stock
            }));
            setDetectedProduct(null);
        }
    };

    const onScanFailure = (error) => {
        // Handle scan failure silently
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/products', formData);
            navigate('/vendor-dashboard');
        } catch (error) {
            alert('Failed to add product. ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans text-nukkad-blue">
            <header className="flex items-center gap-4 mb-6 pt-2">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/vendor-dashboard')}
                    className="p-2 sm:p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Add Product</h1>
            </header>

            <AnimatePresence mode="wait">
                {isScanning ? (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-4 sm:p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center gap-6"
                    >
                        <div className="w-full max-w-[320px] aspect-square bg-gray-900 rounded-[2rem] overflow-hidden relative border-4 border-nukkad-green/20">
                            <div id="reader" className="w-full h-full"></div>
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-nukkad-orange/50 shadow-[0_0_15px_rgba(255,159,28,0.8)] animate-pulse pointer-events-none" />
                        </div>
                        <div className="text-center px-4">
                            <p className="font-black text-nukkad-blue text-sm uppercase tracking-tight">Focus on Barcode</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black leading-relaxed">Center the code within the frame to auto-recognize</p>
                        </div>
                        <button
                            onClick={() => setIsScanning(false)}
                            className="w-full py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] border-t border-gray-50"
                        >
                            Back to Form
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Detection State Hub */}
                        {initialMode === 'scan' && !scanResult && !isScanning && (
                            <motion.div
                                className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-nukkad-orange/20 flex flex-col items-center gap-6 text-center shadow-sm"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-nukkad-orange shadow-inner">
                                    <Camera size={32} />
                                </div>
                                <div className="px-2">
                                    <h3 className="font-black text-nukkad-blue uppercase tracking-tight">Camera Ready</h3>
                                    <p className="text-[10px] text-gray-400 mt-2 max-w-[220px] font-bold uppercase tracking-wide leading-relaxed">Scan a real product to automatically fetch its details!</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsScanning(true)}
                                    className="w-full max-w-[200px] py-4 bg-nukkad-orange text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-nukkad-orange/20 flex items-center justify-center gap-2"
                                >
                                    <Zap size={14} fill="currentColor" /> Start Scanner
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Smart Detected UI */}
                        {detectedProduct && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-nukkad-green/10 to-nukkad-green/5 border border-nukkad-green/20 p-5 rounded-[2rem] shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-nukkad-green/20 rounded-lg text-nukkad-green">
                                            <Sparkles size={16} fill="currentColor" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-nukkad-green">Smart AI Detection</span>
                                    </div>
                                    <button onClick={() => setDetectedProduct(null)}>
                                        <X size={16} className="text-gray-400" />
                                    </button>
                                </div>
                                <div className="mb-5">
                                    <p className="text-xl font-black text-nukkad-blue tracking-tight">{detectedProduct.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] font-black bg-nukkad-green/20 text-nukkad-green px-2 py-0.5 rounded-full uppercase">₹{detectedProduct.price}</p>
                                        <p className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase">Exp. Stock: {detectedProduct.stock}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={applyDetectedProduct}
                                    className="w-full bg-nukkad-green text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-nukkad-green/20"
                                >
                                    <CheckCircle2 size={14} /> Auto-fill details
                                </button>
                            </motion.div>
                        )}

                        {/* Barcode Success Feedback (if no smart match) */}
                        {scanResult && !detectedProduct && (
                            <div className="bg-nukkad-green/10 border border-nukkad-green/20 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-nukkad-green" size={20} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-nukkad-green tracking-widest">Barcode Detected</p>
                                        <p className="font-mono text-sm font-bold text-nukkad-blue">{scanResult}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setScanResult(null); setFormData(p => ({ ...p, barcode: '' })) }}>
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 pb-12">
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <section>
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                        <Package size={12} /> Product Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Samosa"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner transition-all"
                                        required
                                    />
                                </section>

                                <div className="grid grid-cols-2 gap-3">
                                    <section>
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                            <IndianRupee size={12} /> Price
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="0.00"
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
                                            placeholder="0"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner"
                                            required
                                        />
                                    </section>
                                </div>

                                <section>
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                        <ScanBarcode size={12} /> Barcode
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="barcode"
                                            placeholder="Optional"
                                            value={formData.barcode}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-nukkad-orange font-bold text-nukkad-blue shadow-inner pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsScanning(true)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-nukkad-orange bg-white rounded-xl shadow-sm border border-orange-50 active:scale-90 transition-transform"
                                        >
                                            <Camera size={20} />
                                        </button>
                                    </div>
                                </section>
                            </div>

                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-nukkad-orange text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-nukkad-orange/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : <><Save size={18} /> Add to Shop</>}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddProduct;
