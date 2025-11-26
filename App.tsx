import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, Role, ComplaintStatus, UrgencyLevel, AIAnalysis } from './types';
import ResidentView from './components/ResidentView';
import OfficialDashboard from './components/OfficialDashboard';
import NotificationToast, { AppNotification } from './components/NotificationToast';
import HelpGuide from './components/HelpGuide';
import { HelpCircle, Users, AlertTriangle, CheckCircle, TrendingUp, FileText } from './components/Icons';
import Tooltip from './components/Tooltip';

// Dummy Initial Data
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    title: 'Clogged Drainage Causing Flooding',
    description: 'The main drainage canal in Purok 2 is blocked by debris. Water is entering houses during light rain.',
    location: 'Purok 2, Maysan Rd.',
    category: 'Infrastructure',
    submittedBy: 'Maria Clara (Resident)',
    submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: ComplaintStatus.PENDING,
    aiAnalysis: {
      priorityScore: 92,
      urgencyLevel: UrgencyLevel.CRITICAL,
      impactAnalysis: "High risk of property damage and waterborne diseases (leptospirosis) due to flooding in residential area.",
      suggestedAction: "Deploy engineering team immediately for declogging. Alert residents.",
      estimatedResourceIntensity: 'MEDIUM',
      confidenceScore: 95
    }
  },
  {
    id: '2',
    title: 'Late Night Videoke Noise',
    description: 'Neighbors singing loudly past 1 AM. Cannot sleep.',
    location: 'Sitio Gitna',
    category: 'Peace and Order',
    submittedBy: 'Jose Rizal (Resident)',
    submittedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: ComplaintStatus.PENDING,
    aiAnalysis: {
      priorityScore: 65,
      urgencyLevel: UrgencyLevel.MEDIUM,
      impactAnalysis: "Disturbance of public peace, affecting sleep and well-being of neighbors.",
      suggestedAction: "Dispatch Tanod patrol to issue warning.",
      estimatedResourceIntensity: 'LOW',
      confidenceScore: 88
    }
  },
  {
    id: '3',
    title: 'Broken Streetlight',
    description: 'Streetlight near the elementary school is flickering.',
    location: 'Near Maysan Elem. School',
    category: 'Infrastructure',
    submittedBy: 'Andres B. (Resident)',
    submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: ComplaintStatus.RESOLVED,
    aiAnalysis: {
      priorityScore: 45,
      urgencyLevel: UrgencyLevel.LOW,
      impactAnalysis: "Reduced visibility at night, minor safety concern.",
      suggestedAction: "Schedule repair with electrical maintenance.",
      estimatedResourceIntensity: 'LOW',
      confidenceScore: 92
    }
  }
];

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.OFFICIAL);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Calculate stats for header (when in Official view)
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === ComplaintStatus.PENDING).length,
      critical: complaints.filter(c => c.aiAnalysis?.urgencyLevel === UrgencyLevel.CRITICAL && c.status !== ComplaintStatus.RESOLVED).length,
      resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
      residentSubmissions: complaints.filter(c => c.submittedBy.toLowerCase().includes('resident')).length,
    };
  }, [complaints]);

  // Request Notification Permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const triggerNotification = (title: string, message: string, type: 'info' | 'critical') => {
    // In-app Toast
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, type }]);

    // Auto-dismiss toast
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);

    // Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addComplaint = (complaint: Complaint) => {
    // Security Check
    if (role !== Role.RESIDENT) {
      console.error("Access Denied: Officials cannot submit complaints.");
      return;
    }

    setComplaints(prev => {
      const exists = prev.find(c => c.id === complaint.id);
      if (exists) {
        // Check if this is an AI update that turned out CRITICAL
        if (!exists.aiAnalysis && complaint.aiAnalysis) {
          const urgency = complaint.aiAnalysis.urgencyLevel;
          if (urgency === UrgencyLevel.CRITICAL || urgency === UrgencyLevel.HIGH) {
            // Wait a tick to ensure simulation feels real
            setTimeout(() => {
              triggerNotification(
                `⚠️ High Priority Alert`,
                `New ${urgency} priority complaint reported: "${complaint.title}"`,
                'critical'
              );
            }, 500);
          }
        }
        return prev.map(c => c.id === complaint.id ? complaint : c);
      }
      return [complaint, ...prev];
    });
  };

  const updateStatus = (id: string, status: ComplaintStatus) => {
    // Security Check
    if (role !== Role.OFFICIAL) {
      console.error("Access Denied: Residents cannot update complaint status.");
      return;
    }

    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status } : c
    ));
  };

  const toggleEscalation = (id: string) => {
    if (role !== Role.OFFICIAL) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const newValue = !c.isEscalated;
        if (newValue) {
          // Trigger notification only when escalating (not de-escalating)
          triggerNotification(
            "Escalation Alert",
            `Complaint "${c.title}" has been escalated to higher authority for immediate review.`,
            'critical'
          );
        }
        return { ...c, isEscalated: newValue };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <NotificationToast notifications={notifications} removeNotification={removeNotification} />
      <HelpGuide isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} role={role} />

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
        title="Get Help"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          How to use this app?
        </span>
      </button>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 z-50">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Branding */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-sm">BM</div>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight text-sm">Barangay Maysan</h1>
                <p className="text-[10px] text-gray-500">AI-Assisted Governance</p>
              </div>
            </div>

            {/* Center: Stats Cards - Only show in Official view */}
            {role === Role.OFFICIAL && (
              <div className="hidden lg:flex items-center gap-2 flex-1 justify-center overflow-x-auto">
                <div className="bg-white px-2 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                  <Tooltip content="Total complaints in system" placement="bottom">
                    <div className="p-1 bg-blue-100 rounded-full text-blue-600 cursor-help">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                  <div>
                    <p className="text-[10px] text-gray-500 leading-none">Total</p>
                    <p className="text-sm font-bold text-gray-900 leading-none mt-0.5">{stats.total}</p>
                  </div>
                </div>
                <div className="bg-white px-2 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                  <Tooltip content="Critical unresolved issues" placement="bottom">
                    <div className="p-1 bg-red-100 rounded-full text-red-600 animate-pulse cursor-help">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                  <div>
                    <p className="text-[10px] text-gray-500 leading-none">Critical</p>
                    <p className="text-sm font-bold text-gray-900 leading-none mt-0.5">{stats.critical}</p>
                  </div>
                </div>
                <div className="bg-white px-2 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                  <Tooltip content="Successfully closed complaints" placement="bottom">
                    <div className="p-1 bg-green-100 rounded-full text-green-600 cursor-help">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                  <div>
                    <p className="text-[10px] text-gray-500 leading-none">Resolved</p>
                    <p className="text-sm font-bold text-gray-900 leading-none mt-0.5">{stats.resolved}</p>
                  </div>
                </div>
                <div className="bg-white px-2 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                  <Tooltip content="Awaiting review or action" placement="bottom">
                    <div className="p-1 bg-amber-100 rounded-full text-amber-600 cursor-help">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                  <div>
                    <p className="text-[10px] text-gray-500 leading-none">Pending</p>
                    <p className="text-sm font-bold text-gray-900 leading-none mt-0.5">{stats.pending}</p>
                  </div>
                </div>
                <div className="bg-white px-2 py-1.5 rounded-lg shadow-sm border border-purple-200 flex items-center gap-2 ring-1 ring-purple-100">
                  <Tooltip content="Submitted by residents" placement="bottom">
                    <div className="p-1 bg-purple-100 rounded-full text-purple-600 cursor-help">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                  <div>
                    <p className="text-[10px] text-gray-500 leading-none">Resident</p>
                    <p className="text-sm font-bold text-gray-900 leading-none mt-0.5">{stats.residentSubmissions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Right: Role Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
              <button
                onClick={() => setRole(Role.RESIDENT)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${role === Role.RESIDENT ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Resident
              </button>
              <button
                onClick={() => setRole(Role.OFFICIAL)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${role === Role.OFFICIAL ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Official
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 max-w-7xl mx-auto w-full">
        {role === Role.RESIDENT ? (
          <ResidentView role={role} complaints={complaints} addComplaint={addComplaint} />
        ) : (
          <OfficialDashboard role={role} complaints={complaints} updateStatus={updateStatus} toggleEscalation={toggleEscalation} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-400">
          <p>Barangay Maysan AI-Assisted Complaints Prioritization System Prototype.</p>
          <p>© 2024 Valenzuela City. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;