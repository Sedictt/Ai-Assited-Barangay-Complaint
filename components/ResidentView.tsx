import React, { useState } from 'react';
import { Complaint, Role, UrgencyLevel } from '../types';
import { Send, MapPin, AlertCircle } from 'lucide-react';

interface ResidentViewProps {
    role: Role;
    complaints: Complaint[];
    addComplaint: (complaint: Complaint) => void;
}

const ResidentView: React.FC<ResidentViewProps> = ({ role, complaints, addComplaint }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Infrastructure');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        'Infrastructure',
        'Peace and Order',
        'Health and Sanitation',
        'Environment',
        'Public Services',
        'Other'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !location.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        const newComplaint: Complaint = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            category,
            submittedBy: 'Current User (Resident)',
            submittedAt: new Date().toISOString(),
            status: 'PENDING' as any,
        };

        // Add complaint immediately
        addComplaint(newComplaint);

        // Simulate AI analysis delay
        setTimeout(() => {
            const mockAIAnalysis = {
                priorityScore: Math.floor(Math.random() * 40) + 60,
                urgencyLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as UrgencyLevel,
                impactAnalysis: 'AI-generated impact analysis based on complaint details.',
                suggestedAction: 'Recommended action based on AI assessment.',
                estimatedResourceIntensity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
                confidenceScore: Math.floor(Math.random() * 20) + 80,
            };

            addComplaint({
                ...newComplaint,
                aiAnalysis: mockAIAnalysis,
            });

            setIsSubmitting(false);
            setTitle('');
            setDescription('');
            setLocation('');
            setCategory('Infrastructure');
        }, 2000);
    };

    const myComplaints = complaints.filter(c => c.submittedBy.includes('Current User'));

    return (
        <div className="p-6 space-y-6">
            {/* Submit Complaint Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Send className="w-6 h-6 text-blue-600" />
                    Submit a Complaint
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief description of the issue"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Purok 3, Main Street"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Provide detailed information about the complaint..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                AI is analyzing your complaint...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Complaint
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* My Complaints */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Complaints</h2>

                {myComplaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>You haven't submitted any complaints yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myComplaints.map(complaint => (
                            <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                            complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {complaint.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {complaint.location}
                                    </span>
                                    <span>{complaint.category}</span>
                                    <span>{new Date(complaint.submittedAt).toLocaleDateString()}</span>
                                </div>

                                {complaint.aiAnalysis && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-700">AI Priority:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${complaint.aiAnalysis.urgencyLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                    complaint.aiAnalysis.urgencyLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                        complaint.aiAnalysis.urgencyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                {complaint.aiAnalysis.urgencyLevel} ({complaint.aiAnalysis.priorityScore}/100)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidentView;
