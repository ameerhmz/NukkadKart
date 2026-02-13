import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';
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
    Edit3
} from 'lucide-react';

const VendorDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLive, setIsLive] = useState(false);
    const [stats, setStats] = useState({ todaySales: 0 });
    const [notification, setNotification] = useState(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        let userInfo = localStorage.getItem('userInfo');

        // FOR TESTING: Injecting mock user if not found
        if (!userInfo) {
            userInfo = JSON.stringify({
                _id: 'mock-vendor-id-123',
                name: 'Mock Vendor',
                isOnline: false,
                token: 'mock-token-xyz'
            });
            localStorage.setItem('userInfo', userInfo);
        }

        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            setIsLive(parsedUser.isOnline || false);
            fetchProducts();
            fetchStats();

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
                // Auto-clear notification after 5 seconds
                setTimeout(() => setNotification(null), 5000);
            });
        }
        else {
            navigate('/login');
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            socket.off('newRequest');
            socket.disconnect();
        };
    }, [navigate]);

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

    const toggleLiveStatus = async () => {
        const newStatus = !isLive;
        setIsLive(newStatus);

        try {
            // Update status on backend
            await api.put('/users/status', { isOnline: newStatus });

            if (newStatus) {
                startLocationTracking();
                setNotification({ title: 'You are LIVE', message: 'Your location is now being shared with customers.', type: 'success' });
            } else {
                stopLocationTracking();
                setNotification({ title: 'Offline', message: 'You are no longer visible on the map.', type: 'info' });
            }
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("Error toggling status", error);
            setIsLive(!newStatus); // Rollback on error
            setNotification({ title: 'Error', message: 'Failed to update status. Please try again.', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const startLocationTracking = () => {
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    socket.emit('updateLocation', {
                        vendorId: user._id,
                        latitude,
                        longitude
                    });
                    api.put('/users/location', { latitude, longitude })
                        .catch(err => console.error("API Location Update Failed", err));
                },
                (error) => console.error("Geo Error", error),
                { enableHighAccuracy: true }
            );
        }
    };

    const stopLocationTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
                setNotification({ title: 'Product Deleted', message: 'Item has been removed from your inventory.', type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            } catch (error) {
                console.error('Delete failed', error);
            }
        }
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen pb-24 font-sans text-nukkad-blue">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-0 left-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center justify-between border ${notification.type === 'success' ? 'bg-nukkad-green/10 border-nukkad-green text-nukkad-green' :
                            notification.type === 'info' ? 'bg-nukkad-orange/10 border-nukkad-orange text-nukkad-orange' :
                                'bg-red-50 border-red-500 text-red-600'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <div>
                                <p className="font-bold text-sm">{notification.title}</p>
                                <p className="text-xs opacity-90">{notification.message}</p>
                            </div>
                        </div>
                        <button onClick={() => setNotification(null)}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8 pt-4">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-3xl font-black tracking-tight flex flex-col uppercase italic">
                        <span className="text-nukkad-orange leading-tight">Nukkad</span>
                        <span className="text-nukkad-green -mt-1 leading-tight">Kart</span>
                    </h1>
                    <div className="flex flex-col items-end gap-2">
                        <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                            Temp Storage ACTIVE
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-nukkad-blue overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Vendor'}`} alt="Avatar" />
                        </div>
                    </div>
                </div>
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        stopLocationTracking();
                        socket.disconnect();
                        navigate('/login');
                    }}
                    className="p-2 transition-colors hover:text-red-500"
                >
                    <LogOut size={22} />
                </motion.button>
            </header>

            {/* Live Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center"
            >
                <div className="flex items-center gap-3 text-nukkad-blue">
                    <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-nukkad-green animate-pulse' : 'bg-gray-300'}`} />
                    <span className="font-bold text-lg tracking-tight">Digital Presence</span>
                </div>
                <button
                    onClick={toggleLiveStatus}
                    className={`relative w-24 h-10 rounded-full transition-all duration-300 flex items-center px-1 ${isLive ? 'bg-nukkad-green' : 'bg-gray-200'
                        }`}
                >
                    <motion.div
                        animate={{ x: isLive ? 56 : 0 }}
                        className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
                    >
                        {isLive ? <Navigation size={14} className="text-nukkad-green" /> : <X size={14} className="text-gray-400" />}
                    </motion.div>
                    <span className={`absolute ${isLive ? 'left-3' : 'right-3'} text-[10px] font-black pointer-events-none ${isLive ? 'text-white' : 'text-gray-400'}`}>
                        {isLive ? 'LIVE' : 'OFF'}
                    </span>
                </button>
            </motion.div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 sm:p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-end relative overflow-hidden"
                >
                    <TrendingUp className="absolute -right-4 -bottom-4 text-nukkad-orange/10 w-20 h-20" />
                    <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Today's Sales</p>
                    <p className="text-xl sm:text-2xl font-black text-nukkad-blue">₹{stats.todaySales}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-4 sm:p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-end relative overflow-hidden"
                >
                    <Package className="absolute -right-4 -bottom-4 text-nukkad-green/10 w-20 h-20" />
                    <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Active Items</p>
                    <p className="text-xl sm:text-2xl font-black text-nukkad-blue">{products.length}</p>
                </motion.div>
            </div>

            {/* Recent Requests Section */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Recent Orders</h2>
                    <button className="text-[10px] font-black uppercase text-nukkad-orange tracking-widest">See All</button>
                </div>
                <div className="space-y-2">
                    {[
                        { id: 1, customer: "Rahul S.", amount: 45, items: "3x Samosa", time: "10m ago", status: "pending" },
                        { id: 2, customer: "Anjali M.", amount: 20, items: "2x Chai", time: "25m ago", status: "completed" }
                    ].map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-nukkad-orange' : 'bg-nukkad-green'}`} />
                                <div className="truncate">
                                    <p className="text-sm font-bold text-nukkad-blue truncate">{order.customer}</p>
                                    <p className="text-[10px] text-gray-400 font-medium truncate">{order.items}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-sm font-black text-nukkad-blue">₹{order.amount}</p>
                                <p className="text-[8px] uppercase font-black text-gray-300 tracking-tighter">{order.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Quick Actions / Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
            >
                <Link to="/vendor/heatmap" className="relative block overflow-hidden bg-nukkad-blue text-white p-6 rounded-3xl shadow-lg ring-1 ring-white/10 group active:scale-[0.98] transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-nukkad-orange/20 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2 tracking-tight">
                                Explore Hotspots <MapIcon size={18} className="text-nukkad-orange" />
                            </h2>
                            <p className="text-[10px] text-blue-100/70 mt-1 uppercase font-black tracking-widest">Identify high-sales areas</p>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Inventory Management */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Inventory</h2>
                </div>

                {/* Add Product Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/add-product?mode=manual')}
                        className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:border-nukkad-orange transition-colors group"
                    >
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-nukkad-orange group-active:scale-90 transition-transform">
                            <Plus size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-nukkad-blue/60 group-hover:text-nukkad-orange">Add Manually</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/add-product?mode=scan')}
                        className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:border-nukkad-green transition-colors group"
                    >
                        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-nukkad-green group-active:scale-90 transition-transform">
                            <ScanBarcode size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-nukkad-blue/60 group-hover:text-nukkad-green">Scan Barcode</span>
                    </motion.button>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } }
                    }}
                    className="space-y-3"
                >
                    {products.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-10 text-center">
                            <Package className="mx-auto text-gray-200 mb-3" size={40} />
                            <p className="text-gray-400 font-bold text-sm">No products in your shop yet.</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4 }}
                                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group active:border-nukkad-orange transition-colors"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-nukkad-blue/20 transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div className="truncate">
                                        <p className="font-black text-nukkad-blue text-sm truncate">{product.name}</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Stock: {product.stock}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="font-black text-nukkad-green text-sm whitespace-nowrap">₹{product.price}</p>
                                    </div>
                                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/edit-product/${product._id}`)}
                                            className="p-2 text-gray-300 hover:text-nukkad-orange active:text-nukkad-orange transition-colors"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="p-2 text-gray-300 hover:text-red-500 active:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-6 left-6 right-6 h-18 py-3 bg-nukkad-blue border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-around px-4 z-40">
                <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 text-nukkad-orange">
                    <LayoutDashboard size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tight">Home</span>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 text-white/40 active:text-white transition-colors">
                    <TrendingUp size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tight">Requests</span>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 text-white/40 active:text-white transition-colors">
                    <LogOut size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tight">Profile</span>
                </motion.div>
            </nav>
        </div>
    );
};

export default VendorDashboard;
