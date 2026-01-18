import React, { useState } from 'react';
import { addSafetyCheckIn } from '../../services/firestoreService';
import { LifeBuoy, CheckCircle, AlertTriangle } from '../Icons';

interface SafetyCheckInProps {
    userId: string;
    userName: string;
    onClose?: () => void;
}

const SafetyCheckIn: React.FC<SafetyCheckInProps> = ({ userId, userName, onClose }) => {
    const [status, setStatus] = useState<'IDLE' | 'SAFE' | 'RESCUE'>('IDLE');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheckIn = async (type: 'SAFE' | 'NEED_RESCUE') => {
        setIsSubmitting(true);
        try {
            // Get location if possible
            let locationStr = 'Unknown Location';
            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    locationStr = `${position.coords.latitude}, ${position.coords.longitude}`;
                } catch (e) {
                    console.warn('Location access denied');
                }
            }

            await addSafetyCheckIn({
                userId,
                userName,
                status: type,
                location: locationStr,
                timestamp: new Date().toISOString(),
                message: message
            });

            setStatus(type === 'SAFE' ? 'SAFE' : 'RESCUE');
            if (onClose) setTimeout(onClose, 2000);
        } catch (error) {
            console.error('Error checking in:', error);
            alert('Failed to submit status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'SAFE') {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-green-100 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Marked as Safe</h3>
                <p className="text-green-700 font-medium">Thank you for letting us know. Stay safe!</p>
            </div>
        );
    }

    if (status === 'RESCUE') {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-red-100 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                    <LifeBuoy className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Rescue Request Sent</h3>
                <p className="text-red-700 font-medium">Your location has been sent to the command center. Help is on the way.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Safety Check-In</h3>
            <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
                During a calamity, please update your status to help us prioritize rescue operations.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => handleCheckIn('SAFE')}
                    disabled={isSubmitting}
                    className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 border border-green-200 rounded-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg"
                >
                    <div className="p-3 bg-green-200 rounded-full text-green-700 mb-3 group-hover:scale-110 transition-transform shadow-sm">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-green-800">I'm Safe</span>
                </button>

                <button
                    onClick={() => handleCheckIn('NEED_RESCUE')}
                    disabled={isSubmitting}
                    className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg"
                >
                    <div className="p-3 bg-red-200 rounded-full text-red-700 mb-3 group-hover:scale-110 transition-transform shadow-sm animate-pulse">
                        <LifeBuoy className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-red-800">Need Rescue</span>
                </button>
            </div>

            <div className="relative">
                <textarea
                    placeholder="Optional: Add details (e.g., 'Trapped on 2nd floor', 'Need insulin')"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-28 transition-all focus:bg-white"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Additional Info
                </div>
            </div>
        </div>
    );
};

export default SafetyCheckIn;
