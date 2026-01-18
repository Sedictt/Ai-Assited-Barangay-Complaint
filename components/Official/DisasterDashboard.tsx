import React, { useEffect, useState } from 'react';
import { EvacuationCenter, SafetyCheckIn } from '../../types';
import {
    subscribeToEvacuationCenters,
    subscribeToSafetyCheckIns,
    addEvacuationCenter,
    updateEvacuationCenter
} from '../../services/firestoreService';
import { Home, LifeBuoy, Users, Plus, AlertTriangle } from '../Icons';

const DisasterDashboard: React.FC = () => {
    const [centers, setCenters] = useState<EvacuationCenter[]>([]);
    const [checkIns, setCheckIns] = useState<SafetyCheckIn[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newCenterName, setNewCenterName] = useState('');
    const [newCenterLocation, setNewCenterLocation] = useState('');
    const [newCenterCapacity, setNewCenterCapacity] = useState(100);

    useEffect(() => {
        const unsubCenters = subscribeToEvacuationCenters(setCenters);
        const unsubCheckIns = subscribeToSafetyCheckIns(setCheckIns);
        return () => {
            unsubCenters();
            unsubCheckIns();
        };
    }, []);

    const handleAddCenter = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addEvacuationCenter({
                name: newCenterName,
                location: newCenterLocation,
                capacity: newCenterCapacity,
                currentCount: 0,
                status: 'ACTIVE'
            });
            setShowAddModal(false);
            setNewCenterName('');
            setNewCenterLocation('');
        } catch (error) {
            console.error('Error adding center:', error);
        }
    };

    const rescueRequests = checkIns.filter(c => c.status === 'NEED_RESCUE');

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                        <LifeBuoy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-red-600 font-bold uppercase tracking-wider">Rescue Needed</p>
                        <p className="text-2xl font-bold text-gray-900">{rescueRequests.length}</p>
                    </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Active Centers</p>
                        <p className="text-2xl font-bold text-gray-900">{centers.filter(c => c.status === 'ACTIVE').length}</p>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Evacuees</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {centers.reduce((acc, curr) => acc + curr.currentCount, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Rescue Requests List */}
            {rescueRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                        <h3 className="font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Priority Rescue Requests
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {rescueRequests.map(req => (
                            <div key={req.id} className="p-4 hover:bg-red-50/50 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900">{req.userName}</p>
                                    <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 mt-1">📍 {req.location}</p>
                                    {req.message && (
                                        <p className="text-sm text-red-600 mt-1 italic">"{req.message}"</p>
                                    )}
                                </div>
                                <button className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">
                                    Dispatch
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Evacuation Centers Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Evacuation Centers</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800"
                    >
                        <Plus className="w-4 h-4" />
                        Add Center
                    </button>
                </div>
                <div className="p-6 grid gap-4 md:grid-cols-2">
                    {centers.map(center => (
                        <div key={center.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <h4 className="font-bold text-gray-900">{center.name}</h4>
                                <select
                                    value={center.status}
                                    onChange={(e) => updateEvacuationCenter(center.id, { status: e.target.value })}
                                    className="text-xs border-gray-200 rounded"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="FULL">Full</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">{center.location}</p>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-700">Occupancy:</span>
                                <input
                                    type="number"
                                    value={center.currentCount}
                                    onChange={(e) => updateEvacuationCenter(center.id, { currentCount: parseInt(e.target.value) })}
                                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                                <span className="text-xs text-gray-500">/ {center.capacity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Center Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="font-bold text-lg mb-4">Add Evacuation Center</h3>
                        <form onSubmit={handleAddCenter} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={newCenterName}
                                    onChange={e => setNewCenterName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={newCenterLocation}
                                    onChange={e => setNewCenterLocation(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={newCenterCapacity}
                                    onChange={e => setNewCenterCapacity(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    Add Center
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisasterDashboard;
