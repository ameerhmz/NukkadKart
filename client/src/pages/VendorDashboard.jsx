import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

import { socket } from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    Plus,
    ScanBarcode,
    LayoutDashboard,
    Package,
    Navigation,
    Map as MapIcon,
    TrendingUp,
    AlertCircle,
    X,
    CheckCircle2,
    Trash2,
    Edit3,
    ShoppingCart,
    ArrowUpRight
} from 'lucide-react';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLive, setIsLive] = useState(false);
    const [stats, setStats] = useState({ todaySales: 0 });
    const [notification, setNotification] = useState(null);
    const watchIdRef = useRef(null);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/analytics/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const startLocationTracking = useCallback(() => {
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (user && user._id) {
                        socket.emit('updateLocation', { vendorId: user._id, latitude, longitude });
                    }
                    api.put('/users/location', { latitude, longitude }).catch(() => { });
                },
                null,
                { enableHighAccuracy: true }
            );
        }
    }, [user]);

    const stopLocationTracking = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    const toggleLiveStatus = async () => {
        const newStatus = !isLive;
        setIsLive(newStatus);
        try {
            await api.put('/users/status', { isOnline: newStatus });
            if (newStatus) {
                startLocationTracking();
                setNotification({ title: 'You are LIVE', message: 'Visible to customers!', type: 'success' });
            } else {
                stopLocationTracking();
                setNotification({ title: 'Offline', message: 'Hidden from map.', type: 'info' });
            }
            setTimeout(() => setNotification(null), 3000);
        } catch {
            setIsLive(!newStatus);
            setNotification({ title: 'Error', message: 'Failed to update status', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    useEffect(() => {
        let userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            setIsLive(parsedUser.isOnline || false);

            fetchProducts();
            fetchStats();

            if (parsedUser.isOnline) {
                startLocationTracking();
            }

            if (!socket.connected) {
                socket.connect();
                socket.emit('joinVendorRoom', parsedUser._id);
            }

            socket.on('newRequest', (newReq) => {
                const customerName = newReq.customer?.name || 'Customer';
                setNotification({
                    title: 'New Request!',
                    message: `From ${customerName}: ${newReq.items}`,
                    type: 'info'
                });
                setTimeout(() => setNotification(null), 5000);
            });
        } else {
            navigate('/login');
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            socket.off('newRequest');
            socket.disconnect();
        };
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
                setNotification({ title: 'Success', message: 'Product removed', type: 'success' });
            } catch (error) {
                console.error('Delete failed', error);
            }
        }
    };

    return (
        <div className="min-h-screen pb-32 text-white bg-animated overflow-hidden">
            {/* Notifications */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-6 right-6 z-[100] p-4 glass-ultra rounded-2xl flex items-center justify-between border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${notification.type === 'success' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'} glow-primary`}>
                                {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div>
                                <h3 className="font-black text-sm tracking-tight uppercase italic gradient-text">{notification.title}</h3>
                                <p className="text-white/40 text-[9px] uppercase font-black tracking-widest">{notification.message}</p>
                            </div>
                        </div>
                        <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/5 rounded-lg">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="px-6 pt-10 pb-6 sticky top-0 bg-black/40 backdrop-blur-3xl z-30 border-b border-white/5">
                <div className="flex justify-between items-center max-w-5xl mx-auto">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter gradient-text">
                            NUKKAD KART
                        </h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.5em] text-white/20 mt-1">Vendor Dashboard</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Vendor</p>
                            <p className="text-sm font-black text-white italic tracking-tight">{user?.name || 'Vendor'}</p>
                        </div>
                        <div className="w-14 h-14 glass-ultra rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden neon-blue">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Vendor'}`} alt="Avatar" className="w-[80%] h-[80%] opacity-80" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-6 mt-6 max-w-4xl mx-auto space-y-8">
                {/* Online Status Indicator (Manual Toggle) */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleLiveStatus}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-dark p-6 rounded-[2rem] flex items-center justify-between border cursor-pointer transition-all ${isLive
                        ? 'border-success/30 neon-green hover:bg-success/5'
                        : 'border-red-500/30 hover:bg-red-500/5'}`}
                >
                    {isLive && <div className="absolute inset-0 bg-success/5 animate-pulse" />}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-4 h-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] ${isLive ? 'bg-success animate-pulse' : 'bg-red-500'}`} />
                        <div>
                            <h2 className="text-xl font-black tracking-tight uppercase italic gradient-text">
                                {isLive ? 'You are Online' : 'You are Offline'}
                            </h2>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                {isLive ? 'Visible to customers automatically' : 'Tap to go Live'}
                            </p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${isLive
                        ? 'bg-success/10 border-success/20 text-success'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {isLive ? 'Live' : 'Offline'}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-8">
                    <motion.div whileHover={{ y: -8 }} className="glass-dark p-8 rounded-[3rem] relative overflow-hidden group neon-blue">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={100} /></div>
                        <div className="p-4 glass-ultra rounded-2xl w-fit mb-6 glow-primary">
                            <TrendingUp className="text-primary" size={28} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Total Revenue</p>
                        <h3 className="text-4xl font-black tracking-tighter italic uppercase gradient-text">₹{stats.todaySales}</h3>
                    </motion.div>
                    <motion.div whileHover={{ y: -8 }} className="glass-dark p-8 rounded-[3rem] relative overflow-hidden group neon-blue">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Package size={100} /></div>
                        <div className="p-4 glass-ultra rounded-2xl w-fit mb-6 glow-primary">
                            <Package className="text-primary" size={28} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Active Products</p>
                        <h3 className="text-4xl font-black tracking-tighter italic uppercase gradient-text">{products.length}</h3>
                    </motion.div>
                </div>

                {/* Quick Explore */}
                <Link to="/vendor/heatmap" className="block relative group">
                    <div className="glass-dark p-10 rounded-[4rem] border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all neon-blue">
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter gradient-text flex items-center gap-4">
                                    Sales Heatmap <ArrowUpRight className="text-primary group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                </h2>
                                <p className="text-[11px] font-black text-white/20 mt-2 uppercase tracking-[0.3em]">View Customer Trends</p>
                            </div>
                            <div className="p-6 glass-ultra rounded-3xl glow-primary">
                                <MapIcon className="text-primary" size={32} />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Inventory List */}
                <section className="space-y-8 pb-32">
                    <div className="flex items-center justify-between px-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 italic">Your Inventory</h2>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/add-product?mode=manual')} className="w-12 h-12 glass-ultra rounded-2xl flex items-center justify-center hover:text-primary hover:border-primary/50 transition-all border border-white/5"><Plus size={20} /></button>
                            <button onClick={() => navigate('/add-product?mode=scan')} className="w-12 h-12 glass-ultra rounded-2xl flex items-center justify-center hover:text-primary hover:border-primary/50 transition-all border border-white/5"><ScanBarcode size={20} /></button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {products.length === 0 ? (
                            <div className="glass-dark p-20 text-center rounded-[4rem] border border-white/5 neon-blue">
                                <Package className="mx-auto text-white/5 mb-8" size={80} />
                                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs italic">No Products Found</p>
                                <button onClick={() => navigate('/add-product?mode=manual')} className="btn-premium mt-10 !px-12 !rounded-2xl !py-4 font-black">Add First Product</button>
                            </div>
                        ) : (
                            products.map((product) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    key={product._id}
                                    className="glass-dark p-6 rounded-[2.5rem] flex items-center justify-between group border border-white/5 hover:border-primary/30 transition-all neon-blue"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 glass-ultra rounded-2xl flex items-center justify-center text-white/10 group-hover:text-primary transition-all border border-white/5 glow-primary">
                                            <ShoppingCart size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl tracking-tight uppercase italic gradient-text leading-none">{product.name}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic mt-3">ID: {product._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-white/20 uppercase mb-1 tracking-widest">Price</p>
                                            <p className="font-black text-2xl italic gradient-text tracking-tighter">₹{product.price}</p>
                                        </div>
                                        <div className="w-px h-12 bg-white/5" />
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/edit-product/${product._id}`)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl glass-ultra text-white/20 hover:text-primary hover:bg-primary/5 transition-all border border-white/5"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl glass-ultra text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all border border-white/5"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Premium Floating Nav */}
            <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-xl glass-ultra rounded-[3rem] p-4 flex items-center justify-around z-50 neon-blue border border-white/10">
                {[
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor-dashboard', active: true },
                    { icon: MapIcon, label: 'Live Map', path: '/customer-map' },
                    { icon: Plus, label: 'Add', path: '/add-product', special: true },
                    { icon: ScanBarcode, label: 'POS', path: '/quick-sale' },
                    { icon: TrendingUp, label: 'Analytics', path: '/vendor/heatmap' },
                    { icon: LogOut, label: 'Logout', action: handleLogout }
                ].map((item, i) => (
                    item.special ? (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(item.path)}
                            className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-black shadow-2xl relative -top-8 border-8 border-black glow-primary"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </motion.button>
                    ) : (
                        <button
                            key={i}
                            onClick={item.action || (() => navigate(item.path))}
                            className={`flex flex-col items-center gap-1.5 px-4 transition-all ${item.active ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
                        >
                            <item.icon size={22} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                        </button>
                    )
                ))}
            </nav>
        </div>
    );
};

export default VendorDashboard;
