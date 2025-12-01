import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info, Shield, Building, AlertTriangle, Cone, Heart, Search, Users, Car, Layers } from './Icons';

const TrafficLayer = () => {
    const map = useMap();
    const maps = useMapsLibrary('maps');

    useEffect(() => {
        if (!map || !maps) return;
        const trafficLayer = new maps.TrafficLayer();
        trafficLayer.setMap(map);
        return () => {
            trafficLayer.setMap(null);
        };
    }, [map, maps]);

    return null;
};

const CommunityMap: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'GOV' | 'HEALTH' | 'PROJECT' | 'EMERGENCY'>('ALL');
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [showTraffic, setShowTraffic] = useState(false);
    const [mapTypeId, setMapTypeId] = useState('roadmap');

    // Real Coordinates for Maysan, Valenzuela City
    const MAYSAN_CENTER = { lat: 14.6988, lng: 120.9781 };

    const locations = [
        {
            id: 1,
            name: 'Maysan Barangay Hall',
            type: 'GOV',
            position: { lat: 14.697740, lng: 120.979240 },
            status: 'Open',
            description: 'Main administrative office. Located on G. Marcelo St.',
            icon: <Building className="w-5 h-5 text-white" />,
            color: 'bg-blue-600',
            borderColor: 'border-blue-600',
            pinColor: '#2563eb'
        },
        {
            id: 10,
            name: '3S Center Maysan',
            type: 'GOV',
            position: { lat: 14.699000, lng: 120.977620 },
            status: 'Open',
            description: 'Satellite government services center. Located on Maysan Road.',
            icon: <Shield className="w-5 h-5 text-white" />,
            color: 'bg-blue-600',
            borderColor: 'border-blue-600',
            pinColor: '#2563eb'
        },
        {
            id: 2,
            name: 'Maysan Health Station',
            type: 'HEALTH',
            position: { lat: 14.699050, lng: 120.977650 }, // Located at 3S Center
            status: 'Open',
            description: 'Located within 3S Center. General check-ups and vaccination.',
            icon: <Heart className="w-5 h-5 text-white" />,
            color: 'bg-green-600',
            borderColor: 'border-green-600',
            pinColor: '#16a34a'
        },
        {
            id: 3,
            name: 'Maysan Elementary School',
            type: 'GOV',
            position: { lat: 14.699167, lng: 120.979722 },
            status: 'Active',
            description: 'Public elementary school and designated evacuation site.',
            icon: <Users className="w-5 h-5 text-white" />,
            color: 'bg-blue-600',
            borderColor: 'border-blue-600',
            pinColor: '#2563eb'
        },
        {
            id: 4,
            name: 'Our Lady of the Holy Rosary Parish',
            type: 'GOV',
            position: { lat: 14.698870, lng: 120.980160 },
            status: 'Open',
            description: 'Community church and disaster relief distribution point.',
            icon: <Heart className="w-5 h-5 text-white" />,
            color: 'bg-purple-600',
            borderColor: 'border-purple-600',
            pinColor: '#9333ea'
        },
        {
            id: 5,
            name: 'PLV Maysan Campus',
            type: 'PROJECT',
            position: { lat: 14.698100, lng: 120.978800 },
            status: 'Active',
            description: 'Pamantasan ng Lungsod ng Valenzuela - New Campus.',
            icon: <Building className="w-5 h-5 text-white" />,
            color: 'bg-orange-500',
            borderColor: 'border-orange-500',
            pinColor: '#f97316'
        },
        {
            id: 6,
            name: 'St. Louis College Valenzuela',
            type: 'GOV',
            position: { lat: 14.696111, lng: 120.971389 },
            status: 'Active',
            description: 'Private educational institution.',
            icon: <Users className="w-5 h-5 text-white" />,
            color: 'bg-blue-600',
            borderColor: 'border-blue-600',
            pinColor: '#2563eb'
        },
        {
            id: 7,
            name: 'Tierra Santa Memorial Park',
            type: 'PROJECT',
            position: { lat: 14.699500, lng: 120.985625 },
            status: 'Open',
            description: 'Memorial park and cemetery.',
            icon: <MapPin className="w-5 h-5 text-white" />,
            color: 'bg-gray-600',
            borderColor: 'border-gray-600',
            pinColor: '#4b5563'
        },
        {
            id: 8,
            name: 'Road Repair - Maysan Road',
            type: 'PROJECT',
            position: { lat: 14.700000, lng: 120.981000 },
            status: 'In Progress',
            description: 'DPWH drainage improvement project. Heavy traffic expected.',
            icon: <Cone className="w-5 h-5 text-white" />,
            color: 'bg-orange-500',
            borderColor: 'border-orange-500',
            pinColor: '#f97316'
        },
        {
            id: 9,
            name: 'Flood Prone Area - Creek',
            type: 'EMERGENCY',
            position: { lat: 14.696500, lng: 120.978500 },
            status: 'Monitor',
            description: 'Water level monitoring station. Caution during heavy rains.',
            icon: <AlertTriangle className="w-5 h-5 text-white" />,
            color: 'bg-red-600',
            borderColor: 'border-red-600',
            pinColor: '#dc2626'
        }
    ];

    const filteredLocations = activeFilter === 'ALL'
        ? locations
        : locations.filter(loc => loc.type === activeFilter);

    const MapController = () => {
        const map = useMap();

        const handleLocate = useCallback(() => {
            if (!map) return;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        map.panTo(pos);
                        map.setZoom(18);
                    },
                    () => {
                        // Handle error
                    }
                );
            }
        }, [map]);

        const toggleMapType = useCallback(() => {
            setMapTypeId(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
        }, []);

        return (
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={toggleMapType}
                    className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 hover:bg-gray-50 text-gray-700 transition-colors"
                    title="Switch Map Type"
                >
                    <Layers className="w-6 h-6" />
                </button>
                <button
                    onClick={handleLocate}
                    className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Locate Me"
                >
                    <MapPin className="w-6 h-6" />
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 z-10 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold font-heading text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Community Map
                            </h1>
                            <p className="text-xs text-gray-500">Real-time community monitoring.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'ALL', label: 'All' },
                                    { id: 'GOV', label: 'Gov' },
                                    { id: 'HEALTH', label: 'Health' },
                                    { id: 'PROJECT', label: 'Projects' },
                                    { id: 'EMERGENCY', label: 'Emergency' }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id as any)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeFilter === filter.id
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>

                            <button
                                onClick={() => setShowTraffic(!showTraffic)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${showTraffic
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Car className={`w-3 h-3 ${showTraffic ? 'text-white' : 'text-gray-500'}`} />
                                Traffic
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative w-full h-full">
                {/* IMPORTANT: Replace 'YOUR_API_KEY' with your actual Google Maps API Key */}
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDmIWikGXEV-QSQsBbHgVHF3PlwIGR5qx8'} libraries={['marker', 'maps']}>
                    <Map
                        defaultCenter={MAYSAN_CENTER}
                        defaultZoom={17}
                        mapTypeId={mapTypeId}
                        // Note: The 'DEMO_MAP_ID' may cause a console warning about preregistered map types.
                        // This is expected when using Advanced Markers without a custom Map ID configured in Google Cloud Console.
                        // To resolve, create a Map ID in Cloud Console and replace 'DEMO_MAP_ID'.
                        mapId={'DEMO_MAP_ID'}
                        style={{ width: '100%', height: '100%' }}
                        options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            zoomControl: false,
                        }}
                    >
                        <MapController />
                        {showTraffic && <TrafficLayer />}

                        {filteredLocations.map((loc) => (
                            <AdvancedMarker
                                key={loc.id}
                                position={loc.position}
                                onClick={() => setSelectedLocation(loc.id)}
                            >
                                <div className={`relative group cursor-pointer`}>
                                    <div className={`w-10 h-10 ${loc.color} rounded-full flex items-center justify-center shadow-xl border-2 border-white transform transition-transform group-hover:scale-110 z-20 relative`}>
                                        {loc.icon}
                                    </div>
                                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 ${loc.color} rotate-45 border-r-2 border-b-2 border-white z-10`}></div>
                                </div>
                            </AdvancedMarker>
                        ))}

                        {selectedLocation && (() => {
                            const loc = locations.find(l => l.id === selectedLocation);
                            if (!loc) return null;
                            return (
                                <InfoWindow
                                    position={loc.position}
                                    onCloseClick={() => setSelectedLocation(null)}
                                    headerContent={<span className="font-bold text-gray-900">{loc.name}</span>}
                                >
                                    <div className="p-1 max-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider ${loc.color}`}>
                                                {loc.type}
                                            </span>
                                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                {loc.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{loc.description}</p>
                                        <button
                                            onClick={() => navigate('/complaints/file')}
                                            className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            Report Issue
                                        </button>
                                    </div>
                                </InfoWindow>
                            );
                        })()}
                    </Map>
                </APIProvider>

                {/* Floating Legend - Moved to Top Left to avoid Google Logo */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 max-w-[140px] z-[1000]">
                    <h4 className="font-bold font-heading text-gray-900 text-[10px] uppercase tracking-wider mb-2">Legend</h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div> Gov
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                            <div className="w-2 h-2 rounded-full bg-green-600 shadow-sm"></div> Health
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm"></div> Project
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                            <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm"></div> Emergency
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityMap;
