import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    MapPin,
    Star,
    Clock,
    Phone,
    Share2,
    Heart,
    Search,
    ShoppingBag,
    UtensilsCrossed,
    Plus
} from 'lucide-react';

const VendorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]); // Simple cart for visual feedback

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendorRes, productsRes] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/products/vendor/${id}`) // Now using the real endpoint
                ]);
                setVendor(vendorRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const addToCart = (product) => {
        setCart([...cart, product]);
        // Visual feedback could go here
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin glow-primary"></div>
        </div>
    );

    if (!vendor) return <div className="text-white text-center mt-20">Vendor not found</div>;

    // Valid categories matching schema
    const categories = ['All', 'Snacks', 'Drinks', 'Meals', 'Desserts', 'Other'];

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => (p.category || 'Snacks') === activeCategory);

    return (
        <div className="min-h-screen bg-black font-sans text-white pb-32">
            {/* Hero Section */}
            <div className="relative h-72 w-full overflow-hidden rounded-b-[3rem] shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
                <img
                    src={`https://source.unsplash.com/random/800x600/?streetfood,${vendor.name}`} // Fallback/Dynamic image
                    alt="Cover"
                    className="w-full h-full object-cover grayscale-[0.2]"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'}
                />

                {/* Navbar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 glass-ultra rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-4">
                        <button className="w-12 h-12 glass-ultra rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5">
                            <Heart size={20} />
                        </button>
                        <button className="w-12 h-12 glass-ultra rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Vendor Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <div className="flex justify-between items-end">
                        <div>
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black italic uppercase tracking-tighter mb-2 gradient-text"
                            >
                                {vendor.name}
                            </motion.h1>
                            <div className="flex items-center gap-4 text-sm font-bold text-white/60">
                                <span className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> 1.2 km</span>
                                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.8</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> 10-20 min</span>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl glass-ultra border border-white/10 backdrop-blur-md ${vendor.isOnline ? 'text-green-400' : 'text-red-400'}`}>
                            <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${vendor.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                {vendor.isOnline ? 'Open Now' : 'Closed'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="px-6 mt-8">
                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-white/30" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search menu..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all font-bold"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat
                                ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <UtensilsCrossed size={48} className="mx-auto text-white/10 mb-4" />
                            <p className="text-white/30 font-black uppercase tracking-widest">Menu Empty</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={product._id}
                                className="glass-dark p-4 rounded-[2rem] flex gap-4 border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div className="w-24 h-24 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0 relative">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10">
                                            <UtensilsCrossed size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-black text-lg leading-tight mb-1">{product.name}</h3>
                                        <p className="text-xs text-white/40 line-clamp-2">Delicious street food item with secret spices.</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xl font-black gradient-text">₹{product.price}</span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg active:scale-90"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Cart Button (if items in cart) */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50"
                    >
                        <button className="w-full glass-ultra bg-primary/20 backdrop-blur-xl border border-primary/30 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_40px_rgba(59,130,246,0.3)] group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black shadow-lg">
                                    {cart.length}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total</p>
                                    <p className="text-lg font-black text-white">₹{cart.reduce((a, b) => a + b.price, 0)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm">
                                View Cart <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorProfile;
