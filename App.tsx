import React, { useState, useEffect } from 'react';
import { Complaint, Role, ComplaintStatus, UrgencyLevel, AIAnalysis } from './types';
import ResidentView from './components/ResidentView';
import OfficialDashboard from './components/OfficialDashboard';
import NotificationToast, { AppNotification } from './components/NotificationToast';
import HelpGuide from './components/HelpGuide';
import { HelpCircle } from './components/Icons';

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

  // Request Notification Permissions
  useEffect(() => {
    if ('Not ification' in window && Notification.permission !== 'granted') {
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

      {/* Floating Help Button with Glow */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-8 right-8 z-50 gradient-purple text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group hover:scale-110 animate-glow-pulse hover-lift"
        title="Get Help"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 glass-strong text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-medium shadow-lg">
          💡 How to use this app?
        </span>
      </button>

      {/* Glassmorphic Header */}
      <header className="glass-strong border-b border-white/10 z-40 sticky top-0 backdrop-blur-xl animate-fade-in-up shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 animate-scale-in">
            <div className="gradient-purple text-white p-3 rounded-xl font-bold text-lg shadow-lg transform hover:scale-110 transition-transform duration-300">
              BM
            </div>
            <div>
              <h1 className="font-bold text-white leading-tight text-xl tracking-tight">Barangay Maysan</h1>
              <p className="text-xs text-purple-200 font-medium">✨ AI-Assisted Governance Platform</p>
            </div>
          </div>

          <div className="flex glass p-1.5 rounded-xl gap-1 shadow-lg">
            <button
              onClick={() => setRole(Role.RESIDENT)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform ${role === Role.RESIDENT
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              👤 Resident View
            </button>
            <button
              onClick={() => setRole(Role.OFFICIAL)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform ${role === Role.OFFICIAL
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              🏛️ Official Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Animated Background */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {role === Role.RESIDENT ? (
          <ResidentView role={role} complaints={complaints} addComplaint={addComplaint} />
        ) : (
          <OfficialDashboard role={role} complaints={complaints} updateStatus={updateStatus} toggleEscalation={toggleEscalation} />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="glass-strong border-t border-white/10 mt-auto backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sm font-medium text-white/80 mb-1">Barangay Maysan AI-Assisted Complaints Prioritization System</p>
          <p className="text-xs text-white/50">© 2024 Valenzuela City. All Rights Reserved. <span className="gradient-text font-semibold">Powered by AI</span></p>
        </div>
      </footer>
    </div>
  );
};

export default App;