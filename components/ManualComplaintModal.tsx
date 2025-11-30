import React, { useState } from 'react';
import { X, Save, Users, FileText, MapPin, Phone, Info } from './Icons';
import { Complaint, ComplaintStatus } from '../types';

interface ManualComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (complaint: Complaint) => void;
}

const ManualComplaintModal: React.FC<ManualComplaintModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General',
        location: '',
        contactNumber: '',
        residentName: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create new complaint object
        const newComplaint: Complaint = {
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            contactNumber: formData.contactNumber,
            submittedBy: formData.residentName || 'Walk-in Resident',
            submittedAt: new Date().toISOString(),
            status: ComplaintStatus.PENDING,
            isEscalated: false,
            photos: [] // Manual entry usually doesn't have photos initially, or handled separately
        };

        onSubmit(newComplaint);
        onClose();
        // Reset form
        setFormData({
            title: '',
            description: '',
            category: 'General',
            location: '',
            contactNumber: '',
            residentName: ''
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Walk-in Complaint Entry</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex gap-2 items-start">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Use this form to record complaints from residents visiting the Barangay Hall. You are acting as the bridge for their concern.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Resident Name (Optional)</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.residentName}
                                    onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Name of the complainant"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Complaint Title <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="General">General</option>
                                    <option value="Public Safety">Public Safety</option>
                                    <option value="Health">Health</option>
                                    <option value="Environment">Environment</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Noise">Noise</option>
                                    <option value="Traffic">Traffic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact No.</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="09..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Where is this happening?"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                placeholder="Provide full details of the complaint..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualComplaintModal;
