import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { socket } from '../utils/socket';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Store, User } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.role === 'vendor') {
                // 1. Set online immediately
                try {
                    await api.put('/users/status', { isOnline: true });
                } catch (err) {
                    console.error("Failed to set status online", err);
                }

                // 2. Try to get location and update, then navigate
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                                // Update backend
                                await api.put('/users/location', { latitude, longitude });

                                // Update socket
                                if (!socket.connected) socket.connect();
                                socket.emit('joinVendorRoom', data._id);
                                socket.emit('updateLocation', { vendorId: data._id, latitude, longitude });
                            } catch (locErr) {
                                console.error("Location update failed", locErr);
                            }
                            navigate('/vendor-dashboard');
                        },
                        (err) => {
                            console.error("Geolocation error", err);
                            navigate('/vendor-dashboard');
                        },
                        { enableHighAccuracy: true, timeout: 5000 }
                    );
                } else {
                    navigate('/vendor-dashboard');
                }
            } else {
                navigate('/customer-map');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-animated overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-float" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-dark p-10 rounded-[3rem] relative neon-blue"
            >
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 glass-ultra rounded-[2.5rem] flex items-center justify-center border border-white/10 rotate-12 glow-primary">
                            <Store className="text-primary" size={48} />
                        </div>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter italic uppercase gradient-text leading-none">Nukkad</h1>
                    <h1 className="text-6xl font-black tracking-tighter italic uppercase gradient-text leading-none">Kart</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic mt-4">Empowering Local Commerce</p>
                </div>

                <div className="flex items-center gap-4 mb-10 px-2">
                    <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    <h2 className="text-2xl font-black uppercase tracking-tight italic gradient-text">Login</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Email Address</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-premium pl-16 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                placeholder="vendor@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Password</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-premium pl-16 !bg-white/5 !border-white/5 focus:!border-primary/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="btn-premium w-full flex items-center justify-center gap-3 !py-6 !rounded-[2rem] shadow-white/5"
                    >
                        {loading ? 'Logging in...' : 'Login'} <ArrowRight size={20} />
                    </motion.button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/20">
                        New to NukkadKart? <Link to="/register" className="text-primary hover:text-white transition-colors">Create Account</Link>
                    </p>
                </div>
            </motion.div>

            {/* Bottom Status */}
            <div className="mt-12 flex gap-10 items-center opacity-20 select-none grayscale">
                <div className="flex items-center gap-2">
                    <Store size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                    <LogIn size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protected</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
