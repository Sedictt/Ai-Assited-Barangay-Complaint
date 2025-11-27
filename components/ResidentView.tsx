import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintStatus, Role } from '../types';
import { analyzeComplaint } from '../services/geminiService';
import StatusBadge from './StatusBadge';
import { FileText, MapPin, Loader2, Lock, Info, Send, Clock, CheckCircle, Activity, ChevronRight, Upload, X, Image } from './Icons';
import Tooltip from './Tooltip';

interface ResidentViewProps {
    complaints: Complaint[];
    addComplaint: (c: Complaint) => void;
    role: Role;
}

const ResidentView: React.FC<ResidentViewProps> = ({ complaints, addComplaint, role }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Sanitation');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    newPhotos.push(event.target.result as string);
                    if (newPhotos.length === files.length) {
                        setPhotos([...photos, ...newPhotos]);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newComplaint: Complaint = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            location,
            category,
            submittedBy: "Juan Dela Cruz (Resident)",
            submittedAt: new Date().toISOString(),
            status: ComplaintStatus.PENDING,
            isAnalyzing: true,
            photos: photos.length > 0 ? photos : undefined,
        };

        // Optimistic UI Update
        addComplaint(newComplaint);

        // Simulate submission delay for UX
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            // Clear form
            setTitle('');
            setDescription('');
            setLocation('');
            setPhotos([]);

            // Hide success message after 3s
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);

        // Perform AI Analysis in background
        try {
            const analysis = await analyzeComplaint(title, description, location, category);
            addComplaint({ ...newComplaint, aiAnalysis: analysis, isAnalyzing: false });
        } catch (err) {
            console.error(err);
            addComplaint({ ...newComplaint, isAnalyzing: false });
        }
    };

    const myComplaints = complaints.filter(c => c.submittedBy.includes("Resident"));

    const stats = useMemo(() => {
        return {
            total: myComplaints.length,
            resolved: myComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
            pending: myComplaints.filter(c => c.status === ComplaintStatus.PENDING).length
        };
    }, [myComplaints]);

    return (
        <div className="space-y-6">
            {/* Hero / Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-64 h-64 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Hello, Resident!</h1>
                        <p className="text-blue-100 mt-1 max-w-lg">
                            Thank you for helping us keep Barangay Maysan safe and clean. Your reports allow us to take action where it matters most.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20 min-w-[140px]">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-blue-100 uppercase font-medium">Submitted</p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20 min-w-[140px]">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.resolved}</p>
                                <p className="text-xs text-blue-100 uppercase font-medium">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                                <Send className="w-4 h-4 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">File a New Report</h2>
                        </div>

                        <div className="p-6">
                            {showSuccess ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                                    <p className="text-gray-600">
                                        Your complaint has been successfully queued for AI analysis. You can track it in the history panel.
                                    </p>
                                    <button
                                        onClick={() => setShowSuccess(false)}
                                        className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 underline"
                                    >
                                        File another report
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-gray-700">What is the issue?</label>
                                            <Tooltip content="A short summary like 'No Water', 'Flooding', or 'Loud Noise'.">
                                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Uncollected Garbage Pile"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-gray-700">Category</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none text-sm bg-white"
                                            >
                                                <option>Sanitation</option>
                                                <option>Infrastructure/Roads</option>
                                                <option>Peace and Order</option>
                                                <option>Health</option>
                                                <option>Others</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                                <ChevronRight className="w-4 h-4 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-gray-700">Exact Location</label>
                                            <Tooltip content="Include street names or landmarks to help us find it.">
                                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="e.g. Purok 3, Near the Basketball Court"
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-gray-700">Description</label>
                                        </div>
                                        <textarea
                                            required
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe what happened, when it started, and how urgent it feels..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                                        />
                                    </div>

                                    {/* Photo Upload Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-gray-700">Photo Evidence (Optional)</label>
                                            <Tooltip content="Upload up to 5 photos to support your complaint.">
                                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>

                                        {/* Upload Button */}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoChange}
                                                disabled={photos.length >= 5}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all cursor-pointer ${photos.length >= 5
                                                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                                                    }`}
                                            >
                                                <Upload className="w-5 h-5" />
                                                <span className="text-sm font-medium">
                                                    {photos.length >= 5 ? 'Maximum 5 photos' : 'Upload Photos'}
                                                </span>
                                                {photos.length > 0 && (
                                                    <span className="text-xs text-gray-500">({photos.length}/5)</span>
                                                )}
                                            </label>
                                        </div>

                                        {/* Photo Previews */}
                                        {photos.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                {photos.map((photo, index) => (
                                                    <div key={index} className="relative group aspect-square">
                                                        <img
                                                            src={photo}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removePhoto(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Submit Report</span>
                                                    <Send className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-3">
                                            By submitting, you agree to our data privacy policy.
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-500" />
                        Your Activity History
                    </h2>

                    <div className="space-y-4">
                        {myComplaints.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium text-lg">No complaints submitted yet.</p>
                                <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
                                    Use the form on the left to file your first report and help improve our community.
                                </p>
                            </div>
                        ) : (
                            myComplaints.map((c) => (
                                <div key={c.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                                    <div className="p-5 flex flex-col sm:flex-row gap-4">
                                        {/* Status Column */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:w-24 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 pb-3 sm:pb-0 sm:pr-4">
                                            <div className="text-center sm:text-left">
                                                <span className="block text-xs text-gray-400 font-medium uppercase mb-1">Status</span>
                                                <StatusBadge status={c.status} />
                                            </div>
                                            {c.isAnalyzing ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 mt-1">
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                                                </span>
                                            ) : (
                                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                                    <Clock className="w-3 h-3" /> Updated
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                                    {c.title}
                                                </h3>
                                                <Tooltip content="Residents cannot change the status. Only officials can resolve issues." placement="bottom">
                                                    <Lock className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors cursor-help" />
                                                </Tooltip>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{c.description}</p>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    {c.location}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                    {c.category}
                                                </div>
                                                <span className="text-gray-400 ml-auto">{new Date(c.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Footer / Feedback */}
                                    {!c.isAnalyzing && c.aiAnalysis && (
                                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center gap-2 text-xs">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-600">
                                                <div className={`w-2 h-2 rounded-full ${c.aiAnalysis.urgencyLevel === 'CRITICAL' ? 'bg-red-500' : c.aiAnalysis.urgencyLevel === 'HIGH' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                                AI Priority Assessment: {c.aiAnalysis.urgencyLevel}
                                            </div>
                                            <span className="text-gray-400 mx-2">•</span>
                                            <span className="text-gray-500 truncate max-w-md">
                                                {c.aiAnalysis.impactAnalysis}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentView;




