import React, { useEffect, useState } from 'react';
import { GoogleMap, HeatmapLayer, LoadScript } from '@react-google-maps/api';
import api from '../utils/api';

const libraries = ['visualization'];

const mapContainerStyle = {
    width: '100%',
    height: '100vh'
};

const center = {
    lat: 26.8467, // Default to Lucknow
    lng: 80.9462
};

const VendorHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [userLocation, setUserLocation] = useState(center);

    useEffect(() => {
        // Fetch heatmap data
        const fetchHeatmapData = async () => {
            try {
                const { data } = await api.get('/analytics/heatmap');
                // Transform data for Google Maps HeatmapLayer
                const points = data.map(point => ({
                    location: new window.google.maps.LatLng(point.lat, point.lng),
                    weight: point.weight
                }));
                setHeatmapData(points);
            } catch (error) {
                console.error("Error fetching heatmap data", error);
            }
        };

        fetchHeatmapData();

        // Get current location to center map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => console.log("Location access denied, using default center")
            );
        }
    }, []);

    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        return <div>Google Maps API Key missing!</div>;
    }

    return (
        <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
        >
            <div className="relative">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={13}
                    center={userLocation}
                >
                    {heatmapData.length > 0 && (
                        <HeatmapLayer
                            data={heatmapData}
                            options={{
                                radius: 20,
                                opacity: 0.6
                            }}
                        />
                    )}
                </GoogleMap>

                <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10">
                    <h2 className="text-xl font-bold mb-2">Sales Heatmap (Last 7 Days)</h2>
                    <p className="text-sm text-gray-600">
                        Red areas indicate higher sales volume.<br />
                        Use this to plan your parking spot!
                    </p>
                </div>
            </div>
        </LoadScript>
    );
};

export default VendorHeatmap;
