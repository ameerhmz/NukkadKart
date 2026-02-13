import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ScanBarcode,
    ShoppingCart,
    CheckCircle2,
    X,
    Camera,
    Zap,
    History
} from 'lucide-react';

const QuickSale = () => {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [lastSale, setLastSale] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Manual entry
    const [manualCode, setManualCode] = useState('');

    const scannerRef = useRef(null);

    useEffect(() => {
        let timer;
        if (isScanning) {
            timer = setTimeout(async () => {
                const element = document.getElementById("reader");
                if (!element) return;
                try {
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                        handleScan,
                        null
                    );
                } catch (err) { console.error(err); }
            }, 500);
        }
        return () => {
            if (timer) clearTimeout(timer);
            if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => { });
        };
    }, [isScanning]);

    const handleScan = (decodedText) => {
        if (!loading) {
            processSale(decodedText);
        }
    };

    const processSale = async (code) => {
        setLoading(true);
        setError(null);
        try {
            // Stop scanner temporarily to prevent double scan
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.pause();
            }

            const { data } = await api.post('/products/sell', { barcode: code, quantity: 1 });

            if (data.success) {
                setLastSale({
                    ...data.product,
                    time: new Date().toLocaleTimeString(),
                    total: data.totalAmount
                });
                setScanResult(code);

                // Auto-resume scanning after 2 seconds for next item
                setTimeout(async () => {
                    setLastSale(null);
                    setScanResult('');
                    if (isScanning && scannerRef.current) {
                        await scannerRef.current.resume();
                    }
                }, 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Sale Failed');
            setTimeout(async () => {
                setError(null);
                if (isScanning && scannerRef.current) {
                    await scannerRef.current.resume();
                }
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode) {
            processSale(manualCode);
            setManualCode('');
        }
    };

    return (
        <div className="min-h-screen bg-animated text-white pb-20 overflow-hidden relative">
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
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic gradient-text">Quick POS</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Instant Checkout</p>
                </div>
            </header>

            <main className="px-6 max-w-xl mx-auto mt-8 space-y-6">

                {/* Scanner Section */}
                <div className="glass-dark p-6 rounded-[3rem] neon-blue border border-white/5 relative overflow-hidden">
                    {isScanning ? (
                        <>
                            <div className="w-full aspect-square bg-black rounded-[2.5rem] overflow-hidden relative border border-white/10 mb-6">
                                <div id="reader" className="w-full h-full"></div>
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)] animate-pulse pointer-events-none" />
                            </div>
                            <button onClick={() => setIsScanning(false)} className="w-full py-4 glass-ultra rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Pause Camera</button>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-24 h-24 mx-auto glass-ultra rounded-full flex items-center justify-center mb-6 glow-primary">
                                <Camera size={40} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic mb-2">Scanner Idle</h3>
                            <button onClick={() => setIsScanning(true)} className="btn-premium px-10 py-4 !rounded-2xl font-black uppercase tracking-widest text-xs">Activate Camera</button>
                        </div>
                    )}
                </div>

                {/* Feedback Area */}
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-primary/20 p-4 rounded-2xl text-center border border-primary/30"
                        >
                            <p className="text-primary font-black uppercase tracking-widest text-xs animate-pulse">Processing Transaction...</p>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/20 p-6 rounded-[2rem] text-center border border-red-500/30 neon-red"
                        >
                            <X size={32} className="mx-auto text-red-500 mb-2" />
                            <h3 className="text-red-500 font-black uppercase italic">Transaction Failed</h3>
                            <p className="text-white/60 text-xs mt-1">{error}</p>
                        </motion.div>
                    )}

                    {lastSale && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-green-500/20 p-8 rounded-[2.5rem] text-center border border-green-500/30 neon-green relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 size={100} /></div>
                            <h2 className="text-4xl font-black italic uppercase text-white mb-2">Sold!</h2>
                            <p className="text-green-400 font-black uppercase tracking-widest text-xs mb-4">{lastSale.name}</p>
                            <div className="inline-block px-6 py-2 bg-black/40 rounded-full border border-green-500/20">
                                <span className="text-2xl font-black text-green-400">₹{lastSale.total}</span>
                            </div>
                            <p className="text-[10px] text-white/20 mt-4 font-black uppercase tracking-widest">New Stock: {lastSale.newStock}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Manual Entry */}
                <form onSubmit={handleManualSubmit} className="glass-dark p-6 rounded-[2.5rem] flex items-center gap-4 neon-blue border border-white/5">
                    <Zap className="text-white/20" size={24} />
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Type Barcode..."
                        className="bg-transparent border-none outline-none text-white placeholder:text-white/20 font-black uppercase tracking-widest w-full"
                    />
                    <button type="submit" className="glass-ultra p-3 rounded-xl hover:text-primary transition-colors"><ScanBarcode size={20} /></button>
                </form>

            </main>
        </div>
    );
};

export default QuickSale;
