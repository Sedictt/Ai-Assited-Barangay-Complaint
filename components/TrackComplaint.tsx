import React, { useState } from 'react';
import { Search, ChevronLeft, Loader2, MapPin, Calendar, Info, CheckCircle, AlertTriangle, Clock } from './Icons';
import { Complaint, ComplaintStatus } from '../types';
import StatusBadge from './StatusBadge';
import { useNavigate, useLocation } from 'react-router-dom';

interface TrackComplaintProps {
    complaints: Complaint[];
}

const TrackComplaint: React.FC<TrackComplaintProps> = ({ complaints }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchId, setSearchId] = useState('');
    const [result, setResult] = useState<Complaint | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleBack = () => {
        const from = (location.state as any)?.from;
        if (from) {
            navigate(from);
        } else {
            navigate('/');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setIsSearching(true);
        setHasSearched(false);
        setResult(null);

        // Sanitize input: remove leading '#' if present
        const sanitizedId = searchId.trim().replace(/^#/, '');

        // Simulate network delay for better UX
        setTimeout(() => {
            const found = complaints.find(c => c.id === sanitizedId);
            setResult(found || null);
            setHasSearched(true);
            setIsSearching(false);
        }, 600);
    };

    const getStatusStep = (status: ComplaintStatus) => {
        switch (status) {
            case ComplaintStatus.PENDING: return 1;
            case ComplaintStatus.ON_HOLD: return 1; // Treat as pending/hold
            case ComplaintStatus.IN_PROGRESS: return 2;
            case ComplaintStatus.RESOLVED: return 3;
            case ComplaintStatus.DISMISSED: return 3; // End state
            case ComplaintStatus.SPAM: return 3; // End state
            default: return 0;
        }
    };

    const currentStep = result ? getStatusStep(result.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-md">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium text-sm mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </button>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Track Your Complaint</h1>
                        <p className="text-blue-100 text-sm">Enter your Complaint ID to check its real-time status.</p>
                    </div>

                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSearch} className="relative mb-8">
                            <input
                                type="text"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="Enter Complaint ID (e.g. 8x92m...)"
                                className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSearching || !searchId.trim()}
                                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </button>
                        </form>

                        {hasSearched && !result && (
                            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-gray-900 font-bold mb-1">Complaint Not Found</h3>
                                <p className="text-gray-500 text-sm">
                                    We couldn't find a complaint with ID <span className="font-mono font-bold text-gray-700">"{searchId}"</span>.
                                    Please check the ID and try again.
                                </p>
                            </div>
                        )}

                        {result && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Status Stepper */}
                                <div className="mb-8 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                                    <div className="relative z-10 flex justify-between">
                                        {/* Step 1: Received */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Received</span>
                                        </div>

                                        {/* Step 2: In Progress */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>In Action</span>
                                        </div>

                                        {/* Step 3: Resolved */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>Resolved</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{result.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(result.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={result.status} />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <span>{result.location}</span>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <span className="line-clamp-3">{result.description}</span>
                                        </div>
                                    </div>

                                    {result.status === ComplaintStatus.RESOLVED && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex gap-3 items-start">
                                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-green-800">Case Closed</p>
                                                    <p className="text-xs text-green-700 mt-0.5">This complaint has been officially resolved by the barangay.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackComplaint;
