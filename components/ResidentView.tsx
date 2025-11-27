import React, { useState } from 'react';
import { Complaint, ComplaintStatus, Role } from '../types';
import { analyzeComplaint } from '../services/geminiService';
import { uploadPhotos } from '../services/cloudinaryService';
import { MapPin, Loader2, Info, Send, Upload, X, ChevronRight, CheckCircle } from './Icons';
import Tooltip from './Tooltip';

interface ResidentViewProps {
    addComplaint: (c: Complaint) => void;
    role: Role;
}

const ResidentView: React.FC<ResidentViewProps> = ({ addComplaint, role }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Sanitation');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: string[] = [];
        const newFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            newFiles.push(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    newPhotos.push(event.target.result as string);
                    if (newPhotos.length === files.length) {
                        setPhotos([...photos, ...newPhotos]);
                        setPhotoFiles([...photoFiles, ...newFiles]);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
        setPhotoFiles(photoFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const complaintId = Math.random().toString(36).substr(2, 9);
            let photoUrls: string[] = [];

            // Upload photos if any
            if (photoFiles.length > 0) {
                photoUrls = await uploadPhotos(photoFiles);
            }

            const newComplaint: Complaint = {
                id: complaintId,
                title,
                description,
                location,
                category,
                submittedBy: "Juan Dela Cruz (Resident)",
                submittedAt: new Date().toISOString(),
                status: ComplaintStatus.PENDING,
                isAnalyzing: true,
                photos: photoUrls,
            };

            // Optimistic UI Update (or wait for real update via subscription)
            // We'll call addComplaint which now calls Firestore
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
                setPhotoFiles([]);

                // Hide success message after 3s
                setTimeout(() => setShowSuccess(false), 3000);
            }, 1000);

            // Perform AI Analysis in background
            try {
                const analysis = await analyzeComplaint(title, description, location, category);
                // This will update the existing complaint in Firestore
                addComplaint({ ...newComplaint, aiAnalysis: analysis, isAnalyzing: false });
            } catch (err) {
                console.error(err);
                addComplaint({ ...newComplaint, isAnalyzing: false });
            }
        } catch (error) {
            console.error("Error submitting complaint:", error);
            setIsSubmitting(false);
            // Handle error (show toast maybe?)
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                                Your complaint has been successfully queued for AI analysis.
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
    );
};

export default ResidentView;
