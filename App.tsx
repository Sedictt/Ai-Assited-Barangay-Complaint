import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Complaint, Role, ComplaintStatus, UrgencyLevel, AIAnalysis, AuditLogEntry, User, LogCategory } from './types';
import ResidentView from './components/ResidentView';
import OfficialDashboard from './components/OfficialDashboard';
import TrackComplaint from './components/TrackComplaint';
import NotificationToast, { AppNotification } from './components/NotificationToast';
import HelpGuide from './components/HelpGuide';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import LandingPage from './components/LandingPage';
import Services from './components/Services';
import Announcements from './components/Announcements';
import CommunityMap from './components/CommunityMap';
import ChatAssistant from './components/ChatAssistant';
import { HelpCircle, Users, AlertTriangle, CheckCircle, TrendingUp, FileText, Search, Menu, X } from './components/Icons';
import Tooltip from './components/Tooltip';
import { subscribeToComplaints, addComplaint as addComplaintToFirestore, updateComplaint as updateComplaintInFirestore, addAuditLogEntry, addSystemLog } from './services/firestoreService';
import { seedSuperAdmin } from './services/userService';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Determine role based on URL (legacy logic, mostly for ResidentView)
  const role = location.pathname.startsWith('/official') || location.pathname.startsWith('/admin') ? Role.OFFICIAL : Role.RESIDENT;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Seed Super Admin on mount
  useEffect(() => {
    seedSuperAdmin();
  }, []);

  // Calculate stats for header (when in Official view)
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === ComplaintStatus.PENDING || c.status === ComplaintStatus.ON_HOLD).length,
      critical: complaints.filter(c => c.aiAnalysis?.urgencyLevel === UrgencyLevel.CRITICAL && c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.SPAM).length,
      resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
      residentSubmissions: complaints.filter(c => c.submittedBy.toLowerCase().includes('resident')).length,
    };
  }, [complaints]);

  // Subscribe to Firestore complaints
  useEffect(() => {
    setIsLoadingComplaints(true);
    const unsubscribe = subscribeToComplaints((firestoreComplaints) => {
      setComplaints(firestoreComplaints);
      setIsLoadingComplaints(false);
    });

    return () => unsubscribe();
  }, []);

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

  const addComplaint = async (complaint: Complaint) => {
    try {
      // Check if this is a new complaint or an update (AI analysis)
      const exists = complaints.find(c => c.id === complaint.id);

      if (exists) {
        // Update existing complaint (AI analysis completed)
        await updateComplaintInFirestore(complaint.id, {
          aiAnalysis: complaint.aiAnalysis,
          isAnalyzing: complaint.isAnalyzing
        });

        // Check if this is an AI update that turned out CRITICAL
        if (!exists.aiAnalysis && complaint.aiAnalysis) {
          const urgency = complaint.aiAnalysis.urgencyLevel;
          if (urgency === UrgencyLevel.CRITICAL || urgency === UrgencyLevel.HIGH) {
            setTimeout(() => {
              triggerNotification(
                `⚠️ High Priority Alert`,
                `New ${urgency} priority complaint reported: "${complaint.title}"`,
                'critical'
              );
            }, 500);
          }
        }
      } else {
        // Add new complaint to Firestore
        await addComplaintToFirestore(complaint);

        // System Log
        await addSystemLog({
          timestamp: new Date().toISOString(),
          action: 'COMPLAINT_CREATED',
          category: LogCategory.COMPLAINT,
          actor: currentUser ? currentUser.fullName : 'Resident (Public)',
          details: `New complaint created: ${complaint.title}`,
          metadata: { complaintId: complaint.id, userId: currentUser?.id }
        });
      }
    } catch (error) {
      console.error('Error adding/updating complaint:', error);
      triggerNotification(
        'Error',
        'Failed to save complaint. Please try again.',
        'critical'
      );
    }
  };

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    // Security Check
    if (!currentUser) {
      console.error("Access Denied: You must be logged in.");
      return;
    }

    try {
      const complaint = complaints.find(c => c.id === id);
      if (!complaint) return;

      const newLog: AuditLogEntry = {
        id: Date.now().toString(),
        action: 'STATUS_CHANGE',
        author: currentUser.fullName,
        timestamp: new Date().toISOString(),
        details: `Changed status from ${complaint.status} to ${status}`
      };

      await updateComplaintInFirestore(id, { status });
      await addAuditLogEntry(id, newLog);

      // System Log
      await addSystemLog({
        timestamp: new Date().toISOString(),
        action: 'COMPLAINT_STATUS_CHANGE',
        category: LogCategory.COMPLAINT,
        actor: currentUser.fullName,
        details: `Changed status of complaint ${id} to ${status}`,
        metadata: { complaintId: id, userId: currentUser.id }
      });

    } catch (error) {
      console.error('Error updating status:', error);
      triggerNotification(
        'Error',
        'Failed to update status. Please try again.',
        'critical'
      );
    }
  };

  const toggleEscalation = async (id: string) => {
    if (!currentUser) return;

    try {
      const complaint = complaints.find(c => c.id === id);
      if (!complaint) return;

      const newValue = !complaint.isEscalated;

      const newLog: AuditLogEntry = {
        id: Date.now().toString(),
        action: newValue ? 'ESCALATION' : 'DE_ESCALATION',
        author: currentUser.fullName,
        timestamp: new Date().toISOString(),
        details: newValue ? 'Escalated complaint for immediate review' : 'Removed escalation status'
      };

      await updateComplaintInFirestore(id, { isEscalated: newValue });
      await addAuditLogEntry(id, newLog);

      // System Log
      await addSystemLog({
        timestamp: new Date().toISOString(),
        action: newValue ? 'COMPLAINT_ESCALATED' : 'COMPLAINT_DE_ESCALATED',
        category: LogCategory.COMPLAINT,
        actor: currentUser.fullName,
        details: newValue ? `Escalated complaint ${id}` : `De-escalated complaint ${id}`,
        metadata: { complaintId: id, userId: currentUser.id }
      });

      if (newValue) {
        // Trigger notification only when escalating (not de-escalating)
        triggerNotification(
          "Escalation Alert",
          `Complaint "${complaint.title}" has been escalated to higher authority for immediate review.`,
          'critical'
        );
      }
    } catch (error) {
      console.error('Error toggling escalation:', error);
      triggerNotification(
        'Error',
        'Failed to update escalation status. Please try again.',
        'critical'
      );
    }
  };

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    if (!currentUser) return;
    try {
      await updateComplaintInFirestore(id, updates);

      // System Log
      await addSystemLog({
        timestamp: new Date().toISOString(),
        action: 'COMPLAINT_UPDATED',
        category: LogCategory.COMPLAINT,
        actor: currentUser.fullName,
        details: `Complaint ${id} updated`,
        metadata: { complaintId: id, userId: currentUser.id }
      });
    } catch (error) {
      console.error('Error updating complaint:', error);
      triggerNotification('Error', 'Failed to update complaint details.', 'critical');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === Role.SUPERADMIN) {
      navigate('/admin');
    } else {
      navigate('/official');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const isOfficialView = location.pathname.startsWith('/official') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      <NotificationToast notifications={notifications} removeNotification={removeNotification} />
      <ChatAssistant />
      <HelpGuide isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} role={role} />

      {/* Floating Help Button - Only show if not on login page */}
      {location.pathname !== '/login' && (
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
      )}

      {/* Header - Hide on Login Page */}
      {location.pathname !== '/login' && (
        <header className="bg-white shadow-sm border-b border-gray-200 z-50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 z-50">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Branding */}
              <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-lg font-bold text-sm shadow-sm">BM</div>
                <div>
                  <h1 className="font-bold text-gray-900 leading-tight text-base">Barangay Maysan</h1>
                  <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Official Portal</p>
                </div>
              </div>

              {/* Center: Navigation (Public) or Stats (Official) */}
              {currentUser && isOfficialView ? (
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
                  <div className="bg-white px-2 py-1.5 rounded-lg shadow-sm border border-amber-200 flex items-center gap-2">
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
                </div>
              ) : (
                <nav className="hidden md:flex items-center gap-6">
                  <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Home</Link>
                  <Link to="/services" className={`text-sm font-medium transition-colors ${location.pathname === '/services' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Services</Link>
                  <Link to="/announcements" className={`text-sm font-medium transition-colors ${location.pathname === '/announcements' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Bulletin</Link>
                  <Link to="/map" className={`text-sm font-medium transition-colors ${location.pathname === '/map' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Map</Link>
                  <Link to="/track" className={`text-sm font-medium transition-colors ${location.pathname === '/track' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>Track Status</Link>
                </nav>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {currentUser.fullName} ({currentUser.role})
                    </span>
                    {currentUser.role === Role.SUPERADMIN && location.pathname !== '/admin' && (
                      <button
                        onClick={() => navigate('/admin')}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Admin Panel
                      </button>
                    )}
                    {location.pathname !== '/official' && (
                      <button
                        onClick={() => navigate('/official')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Dashboard
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/complaints/file')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg font-semibold text-xs transform hover:-translate-y-0.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Report Issue</span>
                    </button>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg animate-in slide-in-from-top-2">
              <div className="p-4 space-y-3">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Home</Link>
                <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Services</Link>
                <Link to="/announcements" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Bulletin</Link>
                <Link to="/map" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Map</Link>
                <Link to="/complaints/file" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">File Complaint</Link>
                <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Track Status</Link>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/complaints/file" element={<ResidentView role={Role.RESIDENT} addComplaint={addComplaint} />} />
          <Route path="/track" element={<TrackComplaint complaints={complaints} />} />
          <Route path="/services" element={<Services />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/map" element={<CommunityMap />} />

          {/* Login Route */}
          <Route path="/login" element={
            currentUser ? (
              <Navigate to={currentUser.role === Role.SUPERADMIN ? "/admin" : "/official"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />

          {/* Official Dashboard Route (Protected) */}
          <Route path="/official" element={
            currentUser ? (
              <OfficialDashboard
                role={Role.OFFICIAL}
                complaints={complaints}
                currentUser={currentUser}
                updateStatus={updateStatus}
                toggleEscalation={toggleEscalation}
                updateComplaint={updateComplaint}
                addComplaint={addComplaint}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Super Admin Dashboard Route (Protected) */}
          <Route path="/admin" element={
            currentUser && currentUser.role === Role.SUPERADMIN ? (
              <SuperAdminDashboard
                currentUser={currentUser}
              />
            ) : (
              <Navigate to={currentUser ? "/official" : "/login"} replace />
            )
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-sm">BM</div>
                <span className="font-bold text-gray-900">Barangay Maysan</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Empowering the community through technology and transparent governance.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                <li><Link to="/complaints/file" className="hover:text-blue-600">File Complaint</Link></li>
                <li><Link to="/track" className="hover:text-blue-600">Track Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Contact</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>Maysan Road, Valenzuela City</li>
                <li>(02) 8123-4567</li>
                <li>info@barangaymaysan.gov.ph</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400">
            <p>© 2024 Barangay Maysan. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;