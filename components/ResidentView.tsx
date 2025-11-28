import React, { useState } from 'react';
import { Complaint, ComplaintStatus, Role } from '../types';
import { analyzeComplaint } from '../services/geminiService';
import { uploadPhotos } from '../services/cloudinaryService';
import { compressImage } from '../services/imageCompression';
import { MapPin, Loader2, Info, Send, Upload, X, CheckCircle, ChevronRight, Filter, Zap } from './Icons';
import Tooltip from './Tooltip';

interface ResidentViewProps {
    addComplaint: (c: Complaint) => void;
    role: Role;
}

const ResidentView: React.FC<ResidentViewProps> = ({ addComplaint, role }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [category, setCategory] = useState('Sanitation');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);

    const categories = [
        'Sanitation',
        'Infrastructure/Roads',
        'Peace and Order',
        'Health',
        'Others'
    ];

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: string[] = [];
        const newFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                // Compress the image before adding
                const compressedFile = await compressImage(file);
                newFiles.push(compressedFile);

                // Generate preview from compressed file
                const reader = new FileReader();
                await new Promise<void>((resolve) => {
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            newPhotos.push(event.target.result as string);
                        }
                        resolve();
                    };
                    reader.readAsDataURL(compressedFile);
                });
            } catch (error) {
                console.error("Error compressing image:", error);
                // Fallback to original file if compression fails
                newFiles.push(file);
                const reader = new FileReader();
                await new Promise<void>((resolve) => {
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            newPhotos.push(event.target.result as string);
                        }
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
        }

        setPhotos([...photos, ...newPhotos]);
        setPhotoFiles([...photoFiles, ...newFiles]);
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

            if (photoFiles.length > 0) {
                photoUrls = await uploadPhotos(photoFiles);
            }

            const newComplaint: Complaint = {
                id: complaintId,
                title,
                description,
                location,
                contactNumber,
                category,
                submittedBy: "Juan Dela Cruz (Resident)",
                submittedAt: new Date().toISOString(),
                status: ComplaintStatus.PENDING,
                isAnalyzing: true,
                photos: photoUrls,
            };

            addComplaint(newComplaint);

            setTimeout(() => {
                setIsSubmitting(false);
                setShowSuccess(true);
                setTitle('');
                setDescription('');
                setLocation('');
                setContactNumber('');
                setPhotos([]);
                setPhotoFiles([]);
                setCategory('Sanitation');

                setTimeout(() => setShowSuccess(false), 3000);
            }, 1000);

            try {
                const analysis = await analyzeComplaint(title, description, location, category);
                addComplaint({ ...newComplaint, aiAnalysis: analysis, isAnalyzing: false });
            } catch (err) {
                console.error(err);
                addComplaint({ ...newComplaint, isAnalyzing: false });
            }
        } catch (error) {
            console.error("Error submitting complaint:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">File a Report</h2>
                        <p className="text-blue-100 text-xs font-medium">Help us improve Barangay Maysan</p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                            <p className="text-gray-500 text-center max-w-xs mb-8 leading-relaxed">
                                Thank you for your contribution. Your report has been queued for AI analysis.
                            </p>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                File another report
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Selection */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Category</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Filter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium appearance-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Issue Title */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">What is the issue?</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Zap className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Uncollected Garbage"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Exact Location</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Near the Basketball Court"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Contact Number (Optional)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="h-4 w-4 text-gray-400 flex items-center justify-center font-bold text-xs">#</div>
                                    </div>
                                    <input
                                        type="tel"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="e.g. 0912 345 6789"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the details..."
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium resize-none"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 flex justify-between">
                                    <span>Photo Evidence</span>
                                    <span className="text-xs font-normal text-gray-400">Optional (Max 5)</span>
                                </label>

                                <div className="grid grid-cols-4 gap-2">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <img
                                                src={photo}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {photos.length < 5 && (
                                        <div className="relative aspect-square">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                                            >
                                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mb-1" />
                                                <span className="text-[9px] font-bold text-gray-400 group-hover:text-blue-500 uppercase">Add</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing Report...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Complaint</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 mt-4">
                                    By submitting, you confirm that the information is accurate.
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
