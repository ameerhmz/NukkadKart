import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

import { socket } from '../utils/socket';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const defaultCenter = {
    lat: 28.6139, // Default to New Delhi or user location
    lng: 77.2090
};

const CustomerMap = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(defaultCenter);

    useEffect(() => {
        // Connect socket
        if (!socket.connected) socket.connect();

        // Listen for location updates
        socket.on('vendorLocationUpdate', (data) => {
            setVendors(prevVendors => {
                return prevVendors.map(v => {
                    if (v._id === data.vendorId) {
                        return {
                            ...v,
                            location: {
                                type: 'Point',
                                coordinates: [data.longitude, data.latitude]
                            }
                        };
                    }
                    return v;
                });
            });
        });

        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log("Location access denied, using default");
                }
            );
        }

        fetchVendors();

        return () => {
            socket.off('vendorLocationUpdate');
            socket.disconnect();
        };
    }, []);

    const fetchVendors = async () => {
        try {
            const { data } = await api.get('/users/vendors');
            setVendors(data);
        } catch (error) {
            console.error('Failed to fetch vendors', error);
        }
    };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition}
                zoom={14}
            >
                {/* User's Location Marker */}
                <Marker
                    position={currentPosition}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                />

                {/* Vendor Markers */}
                {vendors.map(vendor => (
                    vendor.location && (
                        <Marker
                            key={vendor._id}
                            position={{
                                lat: vendor.location.coordinates[1], // Latitude is 2nd in GeoJSON
                                lng: vendor.location.coordinates[0]  // Longitude is 1st
                            }}
                            onClick={() => setSelectedVendor(vendor)}
                        />
                    )
                ))}

                {selectedVendor && (
                    <InfoWindow
                        position={{
                            lat: selectedVendor.location.coordinates[1],
                            lng: selectedVendor.location.coordinates[0]
                        }}
                        onCloseClick={() => setSelectedVendor(null)}
                    >
                        <div className="p-2">
                            <h3 className="font-bold text-lg">{selectedVendor.name}</h3>
                            <p className="text-green-600 font-semibold">Live Now</p>
                            <button
                                onClick={() => navigate(`/vendor/${selectedVendor._id}`)}
                                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm w-full"
                            >
                                View Profile
                            </button>
                        </div>
                    </InfoWindow>
                )}

                {/* Floating Action Button for List View or Profile */}
                <div className="absolute bottom-20 right-4 flex flex-col gap-2">
                    <button
                        onClick={() => fetchVendors()}
                        className="bg-white p-3 rounded-full shadow-lg text-gray-700"
                    >
                        🔄
                    </button>
                </div>

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 left-0 w-full bg-white shadow-top border-t border-gray-200 p-3 flex justify-around z-50">
                    <span className="text-blue-600 font-semibold" onClick={() => navigate('/customer-map')}>Map</span>
                    <span className="text-gray-400">Requests</span>
                    <span className="text-gray-400" onClick={() => navigate('/login')}>Profile</span>
                </nav>
            </GoogleMap>
        </LoadScript>
    );
};

export default CustomerMap;
