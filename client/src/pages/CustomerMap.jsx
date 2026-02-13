import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { socket } from '../utils/socket';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Navigation,
    RefreshCw,
    User,
    Search,
    Filter,
    List,
    Map as MapIcon,
    ArrowRight,
    ToggleLeft,
    ToggleRight,
    Store,
    Heart
} from 'lucide-react';
import debounce from 'lodash.debounce';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = createCustomIcon('red');
const greyIcon = createCustomIcon('grey');
const blueIcon = createCustomIcon('blue');

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const CustomerMap = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [currentPosition, setCurrentPosition] = useState([28.6139, 77.2090]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllVendors, setShowAllVendors] = useState(false);
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const fetchVendors = useCallback(async (search = '', showAll = false) => {
        setLoading(true);
        try {
            const { data } = await api.get('/users/vendors', {
                params: {
                    search,
                    showAll,
                    latitude: currentPosition[0],
                    longitude: currentPosition[1]
                }
            });
            setVendors(data);
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        } finally {
            setLoading(false);
        }
    }, [currentPosition]);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((term, showAll) => fetchVendors(term, showAll), 500),
        [fetchVendors]
    );

    useEffect(() => {
        // Trigger search when terms change
        debouncedSearch(searchTerm, showAllVendors);
    }, [searchTerm, showAllVendors, debouncedSearch]);

    useEffect(() => {
        if (!socket.connected) socket.connect();

        socket.on('vendorLocationUpdate', (data) => {
            setVendors(prev => prev.map(v =>
                v._id === data.vendorId ? { ...v, location: { ...v.location, coordinates: [data.longitude, data.latitude] } } : v
            ));
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCurrentPosition([latitude, longitude]);
                    // Initial fetch with location
                    fetchVendors(searchTerm, showAllVendors);
                },
                (err) => {
                    console.error("Location denied", err);
                    fetchVendors(); // Fallback fetch without loation sorting
                }
            );
        } else {
            fetchVendors();
        }

        return () => {
            socket.off('vendorLocationUpdate');
            socket.disconnect();
        };
    }, [fetchVendors]);

    const handleVendorClick = (vendor) => {
        setViewMode('map');
        if (vendor.location && vendor.location.coordinates) {
            setCurrentPosition([vendor.location.coordinates[1], vendor.location.coordinates[0]]);
        }
    };

    const addToWishlist = (vendor) => {
        const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!stored.find(v => v._id === vendor._id)) {
            stored.push({ _id: vendor._id, name: vendor.name, email: vendor.email });
            localStorage.setItem('wishlist', JSON.stringify(stored));
        }
    };
    const removeFromWishlist = (vendorId) => {
        const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const updated = stored.filter(v => v._id !== vendorId);
        localStorage.setItem('wishlist', JSON.stringify(updated));
    };
    const isInWishlist = (vendorId) => {
        const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
        return stored.some(v => v._id === vendorId);
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    return (
        <div className="h-screen w-full relative bg-animated overflow-hidden text-white flex flex-col">
            {/* Top Bar - Glassmorphism */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex flex-col gap-4 pointer-events-none">
                {/* Header Row */}
                <div className="flex justify-between items-center pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-dark px-6 py-3 rounded-full flex items-center gap-4 neon-blue border border-white/10"
                    >
                        <div className="w-10 h-10 rounded-full glass-ultra flex items-center justify-center text-primary glow-primary">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Hello</p>
                            <h2 className="text-sm font-black uppercase tracking-tighter gradient-text">{userInfo.name || 'Explorer'}</h2>
                        </div>
                    </motion.div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                        className="w-12 h-12 glass-ultra rounded-full flex items-center justify-center text-white hover:text-primary transition-all glow-primary border border-white/10"
                    >
                        {viewMode === 'map' ? <List size={22} /> : <MapIcon size={22} />}
                    </motion.button>
                </div>

                {/* Search & Filter Row */}
                <div className="flex gap-3 pointer-events-auto items-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 glass-dark p-2 rounded-full flex items-center gap-3 border border-white/5 neon-blue shadow-lg"
                    >
                        <Search size={18} className="text-white/30 ml-3" />
                        <input
                            type="text"
                            placeholder="Find vendors, food, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-white/20 w-full"
                        />
                    </motion.div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAllVendors(!showAllVendors)}
                        className={`px-4 py-3 rounded-full flex items-center gap-2 transition-all border ${showAllVendors
                            ? 'glass-ultra border-primary/50 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                            : 'glass-dark border-white/5 text-white/40'
                            }`}
                    >
                        {showAllVendors ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                            {showAllVendors ? 'All Vendors' : 'Online Only'}
                        </span>
                    </motion.button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative">
                {/* List View Overlay */}
                <AnimatePresence>
                    {viewMode === 'list' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute inset-0 z-[900] bg-black/80 backdrop-blur-xl p-6 pt-36 overflow-y-auto"
                        >
                            <div className="grid grid-cols-1 gap-4 pb-24">
                                {vendors.length === 0 ? (
                                    <div className="text-center mt-20 text-white/30">
                                        <p className="text-sm font-black uppercase tracking-widest">No Vendors Found</p>
                                    </div>
                                ) : (
                                    vendors.map(vendor => (
                                        <div
                                            key={vendor._id}
                                            onClick={() => handleVendorClick(vendor)}
                                            className="glass-dark p-6 rounded-[2rem] border border-white/5 flex items-center justify-between active:scale-95 transition-transform"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${vendor.isOnline ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/20'}`}>
                                                    <Store size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg uppercase italic tracking-tight">{vendor.name}</h3>
                                                    <p className={`text-[10px] uppercase font-black tracking-widest ${vendor.isOnline ? 'text-green-400' : 'text-white/30'}`}>
                                                        {vendor.isOnline ? '● LIVE NOW' : '● OFFLINE'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {vendor.distance && (
                                                    <p className="text-xs font-bold text-white/40 mb-1">{vendor.distance} km</p>
                                                )}
                                                <ArrowRight size={20} className="text-white/20 ml-auto" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Map View */}
                <div className="h-full w-full grayscale-[0.3] invert-[0.9] hue-rotate-[190deg] brightness-[1.1]">
                    <MapContainer
                        center={currentPosition}
                        zoom={15}
                        zoomControl={false}
                        className="h-full w-full"
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={currentPosition} />

                        {/* User Location (Customer View) or 'Me' (Vendor View) */}
                        <Marker position={currentPosition} icon={blueIcon}>
                            <Popup className="premium-popup">
                                <div className="p-2 bg-black text-white font-black uppercase text-center rounded-lg">
                                    {userInfo.role === 'vendor' ? 'My Live Location' : 'You'}
                                </div>
                            </Popup>
                        </Marker>

                        {/* Vendors */}
                        {vendors.map(vendor => (
                            vendor.location && vendor.location.coordinates && (
                                <Marker
                                    key={vendor._id}
                                    position={[vendor.location.coordinates[1], vendor.location.coordinates[0]]}
                                    icon={vendor.isOnline ? redIcon : greyIcon}
                                    eventHandlers={{
                                        click: () => handleVendorClick(vendor),
                                    }}
                                >
                                    <Popup className="premium-popup">
                                        <div className="p-5 bg-black text-white rounded-2xl min-w-[200px]">
                                            <div className="flex justify-between mb-3">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${vendor.isOnline ? 'bg-green-500 text-black' : 'bg-white/20 text-white'}`}>
                                                    {vendor.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-xl italic uppercase tracking-tighter mb-1">{vendor.name}</h3>
                                            <p className="text-[10px] text-white/50 mb-4">{vendor.email}</p>
                                            <button
                                                onClick={() => navigate(`/vendor/${vendor._id}`)}
                                                className="w-full bg-white text-black py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-colors"
                                            >
                                                View Shop
                                            </button>
                                            <button
                                                onClick={() => isInWishlist(vendor._id) ? removeFromWishlist(vendor._id) : addToWishlist(vendor)}
                                                className={`w-full mt-2 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors ${isInWishlist(vendor._id) ? 'bg-pink-500 text-white' : 'bg-white text-black hover:bg-pink-500 hover:text-white'}`}
                                            >
                                                {isInWishlist(vendor._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-ultra rounded-[2.5rem] p-3 flex items-center justify-around z-[2000] neon-blue border border-white/10 shadow-2xl">
                {[
                    { icon: Navigation, label: 'Map', path: '/customer-map', active: true },
                    { icon: RefreshCw, label: 'Sync', action: () => fetchVendors(searchTerm, showAllVendors), special: true },
                    { icon: User, label: 'Profile', path: userInfo.role === 'vendor' ? '/vendor-dashboard' : '/login' },
                    { icon: Heart, label: 'Wishlist', path: '/wishlist' }
                ].map((item, i) => (
                    item.special ? (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={item.action}
                            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg relative -top-6 border-4 border-black glow-primary"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </motion.button>
                    ) : (
                        <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${item.active ? 'text-primary' : 'text-white/30 hover:text-white'}`}
                        >
                            <item.icon size={20} />
                            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    )
                ))}
            </nav>
        </div>
    );
};

export default CustomerMap;
