import React from 'react';
import { X, Bell, AlertTriangle } from './Icons';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'critical';
}

interface NotificationToastProps {
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-80 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border animate-in slide-in-from-right fade-in duration-300 bg-white ${
            notification.type === 'critical' ? 'border-red-200 ring-1 ring-red-100' : 'border-blue-200 ring-1 ring-blue-100'
          }`}
        >
          <div className={`p-2 rounded-full mr-3 shrink-0 ${
            notification.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
             {notification.type === 'critical' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900">{notification.title}</h4>
            <p className="text-sm text-gray-600 mt-1 leading-snug">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;