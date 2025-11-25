import React from 'react';
import { ComplaintStatus, UrgencyLevel } from '../types';

interface StatusBadgeProps {
  status?: ComplaintStatus;
  urgency?: UrgencyLevel;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, urgency }) => {
  if (status) {
    const colors = {
      [ComplaintStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [ComplaintStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [ComplaintStatus.RESOLVED]: 'bg-green-100 text-green-800',
      [ComplaintStatus.DISMISSED]: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  }

  if (urgency) {
    const colors = {
      [UrgencyLevel.LOW]: 'bg-green-100 text-green-800',
      [UrgencyLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [UrgencyLevel.HIGH]: 'bg-orange-100 text-orange-800',
      [UrgencyLevel.CRITICAL]: 'bg-red-100 text-red-800 animate-pulse',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${colors[urgency]}`}>
        {urgency} Priority
      </span>
    );
  }

  return null;
};

export default StatusBadge;