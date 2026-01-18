import React, { useEffect, useState } from 'react';
import { EvacuationCenter } from '../../types';
import { subscribeToEvacuationCenters } from '../../services/firestoreService';
import { Home, Users, AlertTriangle, CheckCircle } from '../Icons';

const EvacuationCenterList: React.FC = () => {
    const [centers, setCenters] = useState<EvacuationCenter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToEvacuationCenters((data) => {
            setCenters(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading evacuation centers...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
                    <Home className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Evacuation Centers</h2>
                    <p className="text-sm text-gray-500">Real-time capacity and status updates</p>
                </div>
            </div>

            {centers.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Active Centers</h3>
                    <p className="text-gray-500">There are no active evacuation centers at this time.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {centers.map((center) => (
                        <div key={center.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{center.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${center.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                            center.status === 'FULL' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {center.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {center.location}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Occupancy</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {center.currentCount} <span className="text-sm text-gray-400 font-medium">/ {center.capacity}</span>
                                        </p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {Math.max(0, center.capacity - center.currentCount)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-500 font-medium">Capacity Usage</span>
                                        <span className={`font-bold ${(center.currentCount / center.capacity) > 0.9 ? 'text-red-600' : 'text-blue-600'}`}>
                                            {Math.round((center.currentCount / center.capacity) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${(center.currentCount / center.capacity) > 0.9 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                    (center.currentCount / center.capacity) > 0.7 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                                        'bg-gradient-to-r from-blue-500 to-blue-600'
                                                }`}
                                            style={{ width: `${Math.min((center.currentCount / center.capacity) * 100, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>

                                {center.needs && (
                                    <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-800 mb-0.5 uppercase tracking-wide">Urgent Needs</p>
                                            <p className="text-sm text-amber-700 leading-relaxed">{center.needs}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvacuationCenterList;
