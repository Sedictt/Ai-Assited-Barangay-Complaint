import React from 'react';
import { X, Image as ImageIcon, Download, ZoomIn } from './Icons';

interface PhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    photos: string[];
    complaintTitle: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ isOpen, onClose, photos, complaintTitle }) => {
    const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);

    if (!isOpen) return null;

    const handleDownload = (photoUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = `complaint-evidence-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Photo Evidence</h2>
                                <p className="text-xs text-gray-600 mt-0.5 truncate max-w-md">{complaintTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {photos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <div className="p-4 bg-gray-100 rounded-full mb-3">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                                <p className="text-sm font-medium">No photos attached to this complaint</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="group relative bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg"
                                    >
                                        {/* Photo */}
                                        <div className="aspect-square relative overflow-hidden bg-gray-200">
                                            <img
                                                src={photo}
                                                alt={`Evidence ${index + 1}`}
                                                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                                onClick={() => setSelectedPhoto(photo)}
                                            />

                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => setSelectedPhoto(photo)}
                                                    className="p-3 bg-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                                                >
                                                    <ZoomIn className="w-5 h-5 text-gray-700" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-600">Photo {index + 1}</span>
                                            <button
                                                onClick={() => handleDownload(photo, index)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                                                title="Download photo"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox for full-size view */}
            {selectedPhoto && (
                <>
                    <div
                        className="fixed inset-0 bg-black/90 z-[60] animate-in fade-in duration-200"
                        onClick={() => setSelectedPhoto(null)}
                    />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none">
                        <div className="relative max-w-7xl max-h-full pointer-events-auto">
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={selectedPhoto}
                                alt="Full size evidence"
                                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PhotoModal;
