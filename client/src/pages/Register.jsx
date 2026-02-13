import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowRight, Store, ShoppingBag } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/register', formData);
            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.role === 'vendor') {
                navigate('/vendor-dashboard');
            } else {
                navigate('/customer-map');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-animated overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-float" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg glass-dark p-10 rounded-[3rem] relative neon-blue"
            >
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase gradient-text mb-2">Create Account</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Join the Community</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 flex items-center gap-3 text-red-400 text-sm font-bold"
                    >
                        <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Full Name</label>
                            <div className="relative group/input">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-premium pl-16 !bg-white/5 !border-white/5"
                                    placeholder="Your Name"
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-premium pl-16 !bg-white/5 !border-white/5"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Email Address</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-premium pl-16 !bg-white/5 !border-white/5"
                                placeholder="vendor@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4 text-center block">Account Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'customer', label: 'Customer', icon: ShoppingBag },
                                { id: 'vendor', label: 'Vendor', icon: Store }
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r.id })}
                                    className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.role === r.id ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-white/5 text-white/20'}`}
                                >
                                    <r.icon size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="btn-premium w-full !py-6 !rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={20} />
                    </motion.button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/20">
                        Already have an account? <Link to="/login" className="text-primary hover:text-white transition-colors">Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
