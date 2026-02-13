import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from 'react-leaflet';
import api from '../utils/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const VendorHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [userLocation, setUserLocation] = useState([26.8467, 80.9462]); // Default Lucknow

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const { data } = await api.get('/analytics/heatmap');
                // Data format: [{ lat, lng, weight }, ...]
                setHeatmapData(data);
            } catch (error) {
                console.error("Error fetching heatmap data", error);
            }
        };

        fetchHeatmapData();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => console.log("Location access denied")
            );
        }
    }, []);

    return (
        <div className="h-screen w-full relative bg-animated overflow-hidden">
            {/* Top Overlay HUD */}
            <div className="absolute top-8 left-8 right-8 z-[1000] pointer-events-none">
                <div className="flex justify-between items-start">
                    <div className="glass-dark p-6 rounded-[2rem] pointer-events-auto neon-blue border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Sales Analytics</p>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter gradient-text">Sales Heatmap</h2>
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-glow-red" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">High Volume</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-glow-blue" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Emerging Area</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Summary Card */}
            <div className="absolute bottom-10 left-8 max-w-sm z-[1000] pointer-events-none">
                <div className="glass-ultra p-8 rounded-[2.5rem] pointer-events-auto neon-blue border border-white/10">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Insights</h3>
                    <p className="text-[11px] leading-relaxed font-black uppercase tracking-widest text-white/40 italic">
                        Red areas indicate high sales volume based on last 7 days. Relocate to these zones for better sales.
                    </p>
                </div>
            </div>

            {/* Map Container */}
            <div className="h-full w-full grayscale-[0.4] invert-[0.9] hue-rotate-[180deg] brightness-[1.1]">
                <MapContainer
                    center={userLocation}
                    zoom={13}
                    zoomControl={false}
                    className="h-full w-full"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater center={userLocation} />

                    {heatmapData.map((point, index) => (
                        <CircleMarker
                            key={index}
                            center={[point.lat, point.lng]}
                            radius={25}
                            pathOptions={{
                                color: '#ff3333',
                                fillColor: '#ff3333',
                                fillOpacity: 0.2 + (point.weight * 0.08),
                                stroke: true,
                                weight: 1,
                                opacity: 0.1
                            }}
                        >
                            <Popup className="premium-popup">
                                <div className="p-4 bg-black text-white rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Sales Count</p>
                                    <h4 className="text-2xl font-black italic leading-none">{point.weight} Units</h4>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                    {/* Current Vendor Location Marker */}
                    <Marker position={userLocation} icon={new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })}>
                        <Popup className="premium-popup">
                            <div className="p-3 bg-black text-white rounded-xl">
                                <p className="text-[9px] font-black uppercase tracking-widest text-violet-400 mb-1">You Are Here</p>
                                <h4 className="text-lg font-black italic">My Shop</h4>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>

            {/* Floating Close Button */}
            <div className="absolute top-8 right-8 z-[1000]">
                <button
                    onClick={() => window.history.back()}
                    className="w-14 h-14 glass-ultra rounded-2xl flex items-center justify-center text-white hover:text-primary transition-all border border-white/10 glow-primary"
                >
                    <span className="font-black">ESC</span>
                </button>
            </div>
        </div>
    );
};

export default VendorHeatmap;
