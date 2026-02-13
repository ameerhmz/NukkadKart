import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Store, Heart, Trash2 } from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(stored);
    setLoading(false);
  }, []);

  const removeFromWishlist = (vendorId) => {
    const updated = wishlist.filter((v) => v._id !== vendorId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-animated p-8 text-white">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-2">
        <Heart className="text-pink-400" /> Wishlist
      </h1>
      {wishlist.length === 0 ? (
        <div className="text-center text-white/40 mt-20">No vendors in your wishlist yet.</div>
      ) : (
        <div className="grid gap-6 max-w-xl mx-auto">
          {wishlist.map((vendor) => (
            <div key={vendor._id} className="glass-dark p-6 rounded-2xl flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase italic tracking-tight">{vendor.name}</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-white/30">{vendor.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/vendor/${vendor._id}`)} className="bg-primary text-white px-4 py-2 rounded-xl font-black text-xs uppercase">View</button>
                <button onClick={() => removeFromWishlist(vendor._id)} className="bg-red-500/20 text-red-400 px-3 py-2 rounded-xl font-black text-xs" title="Remove"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
