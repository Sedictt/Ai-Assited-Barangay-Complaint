import React, { useState, useMemo, useEffect } from 'react';
import { Complaint, ComplaintStatus, UrgencyLevel, Role } from '../types';
import StatusBadge from './StatusBadge';
import { AlertTriangle, TrendingUp, CheckCircle, Users, Loader2, MapPin, Filter, Calendar, Lock, FileText, Info, Flag, Activity, Search, Image, Ban, Edit, Save, X, Shield, Flame, Heart, Building, Phone } from './Icons';
import Tooltip from './Tooltip';
import PhotoModal from './PhotoModal';
import HotlineSidebar from './HotlineSidebar';
import ManualComplaintModal from './ManualComplaintModal';

interface OfficialDashboardProps {
  complaints: Complaint[];
  updateStatus: (id: string, status: ComplaintStatus) => void;
  toggleEscalation: (id: string) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  addComplaint?: (complaint: Complaint) => Promise<void>;
  role: Role;
}

const OfficialDashboard: React.FC<OfficialDashboardProps> = ({ complaints, updateStatus, toggleEscalation, updateComplaint, addComplaint, role }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ title: string; category: string; location: string; contactNumber: string }>({ title: '', category: '', location: '', contactNumber: '' });

  // Unread State
  const [readComplaintIds, setReadComplaintIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('readComplaintIds');
      return new Set(saved ? JSON.parse(saved) : []);
    }
    return new Set();
  });

  const handleComplaintClick = (id: string) => {
    setSelectedId(id);
    if (!readComplaintIds.has(id)) {
      const newSet = new Set(readComplaintIds);
      newSet.add(id);
      setReadComplaintIds(newSet);
      localStorage.setItem('readComplaintIds', JSON.stringify(Array.from(newSet)));
    }
  };

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'PRIORITY' | 'DATE_DESC' | 'DATE_ASC'>('PRIORITY');

  // Derive available categories for filter
  const availableCategories = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.category))).sort();
  }, [complaints]);

  // Sorting and Filtering Logic
  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // 1. Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status === statusFilter);
    } else {
      // Exclude SPAM from 'ALL' view by default
      result = result.filter(c => c.status !== ComplaintStatus.SPAM);
    }

    if (urgencyFilter !== 'ALL') {
      result = result.filter(c => c.aiAnalysis?.urgencyLevel === urgencyFilter);
    }
    if (categoryFilter !== 'ALL') {
      result = result.filter(c => c.category === categoryFilter);
    }

    // 2. Sort
    result.sort((a, b) => {
      // Date Sorting
      if (sortOrder === 'DATE_DESC') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortOrder === 'DATE_ASC') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }

      // Priority Sorting (Default)
      // Active (Pending/In Progress) first, then Resolved/Dismissed
      const isResolvedA = a.status === ComplaintStatus.RESOLVED || a.status === ComplaintStatus.DISMISSED;
      const isResolvedB = b.status === ComplaintStatus.RESOLVED || b.status === ComplaintStatus.DISMISSED;

      if (!isResolvedA && isResolvedB) return -1;
      if (isResolvedA && !isResolvedB) return 1;

      // Then by Priority Score
      const scoreA = a.aiAnalysis?.priorityScore || 0;
      const scoreB = b.aiAnalysis?.priorityScore || 0;
      return scoreB - scoreA;
    });

    return result;
  }, [complaints, statusFilter, urgencyFilter, categoryFilter, sortOrder]);

  // Auto-select first complaint on load or when filter changes
  useEffect(() => {
    if (!selectedId && filteredComplaints.length > 0) {
      // Don't mark as read automatically on auto-select, only on user interaction
      setSelectedId(filteredComplaints[0].id);
    } else if (selectedId && !filteredComplaints.some(c => c.id === selectedId)) {
      // If the currently selected complaint is no longer in the filtered list, select the first one or clear
      setSelectedId(filteredComplaints.length > 0 ? filteredComplaints[0].id : null);
    }
  }, [filteredComplaints, selectedId]);

  const selectedComplaint = complaints.find(c => c.id === selectedId);

  // Reset edit form when selection changes
  useEffect(() => {
    if (selectedComplaint) {
      setEditForm({
        title: selectedComplaint.title,
        category: selectedComplaint.category,
        location: selectedComplaint.location,
        contactNumber: selectedComplaint.contactNumber || ''
      });
      setIsEditing(false);
    }
  }, [selectedComplaint]);

  const handleSaveEdit = () => {
    if (selectedId && updateComplaint) {
      updateComplaint(selectedId, editForm);
      setIsEditing(false);
    }
  };

  const getPriorityBarColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-green-500';
  };

  const handleManualSubmit = async (complaint: Complaint) => {
    if (addComplaint) {
      await addComplaint(complaint);
      setIsManualEntryOpen(false);
      // Optionally select the new complaint or show a success toast
    }
  };

  return (
    <div className="p-6 space-y-6">
      <HotlineSidebar />

      {/* Toolbar: Filter & Sort */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 p-4 rounded-xl shadow-md border border-gray-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="flex items-center gap-2 text-gray-700 font-medium md:hidden">
            <Filter className="w-4 h-4" /> Filters
          </div>
          {/* Filter by Status */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 appearance-none transition-all hover:border-gray-400 shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ backgroundImage: 'none' }}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Filter by Urgency */}
          <select
            className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all hover:border-gray-400 shadow-sm"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="ALL">All Urgencies</option>
            {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          {/* Filter by Category */}
          <select
            className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:bg-gray-50"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:border-l md:border-gray-200 md:pl-4">
          <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all hover:border-gray-400 shadow-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="PRIORITY">AI Priority Score</option>
              <option value="DATE_DESC">Date (Newest)</option>
              <option value="DATE_ASC">Date (Oldest)</option>
            </select>
          </div>

          {/* Restricted Add Button - Now Enabled for Manual Entry */}
          <Tooltip content="Manually enter a complaint for a walk-in resident." placement="bottom">
            <button
              onClick={() => setIsManualEntryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg ml-2 whitespace-nowrap"
            >
              <FileText className="w-4 h-4" /> Walk-in Report
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-1 bg-slate-100 rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[650px] min-h-[400px] ring-1 ring-black/5">
          {/* Priority Legend Helper */}
          <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between gap-2 text-xs text-gray-500 shadow-sm z-10 relative">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> High
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span> Med
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Low
            </div>
            <Tooltip content="Colors represent the AI Priority Score. Red is highest priority." placement="bottom">
              <span className="ml-auto text-blue-600 flex items-center gap-1 cursor-help">
                <Info className="w-3 h-3" /> Priority Legend
              </span>
            </Tooltip>
          </div>

          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center z-0 relative">
            <div>
              <h3 className="font-bold text-gray-900">Complaints Queue</h3>
              <p className="text-xs text-gray-500 mt-1">
                {filteredComplaints.length} result{filteredComplaints.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            {filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No complaints found</h3>
                <p className="text-gray-500 text-xs max-w-[200px] mx-auto mb-4">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
                <button
                  onClick={() => { setStatusFilter('ALL'); setUrgencyFilter('ALL'); setCategoryFilter('ALL'); }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {filteredComplaints.map((c, index) => (
                  <div
                    key={c.id}
                    onClick={() => handleComplaintClick(c.id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border shadow-sm group ${selectedId === c.id
                      ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-md scale-[1.01]'
                      : 'bg-white border-transparent hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Visual Priority Indicator Bar */}
                    {c.aiAnalysis && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${getPriorityBarColor(c.aiAnalysis.priorityScore)}`}
                      />
                    )}

                    {/* Escalation Flag Indicator */}
                    {c.isEscalated && (
                      <div className="absolute top-0 right-0 p-1 bg-red-100 rounded-bl-lg rounded-tr-lg z-10">
                        <Flag className="w-3.5 h-3.5 text-red-600 fill-current" />
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0 pl-2 pr-6">
                        <div className="flex items-center gap-2">
                          {!readComplaintIds.has(c.id) && (
                            <span className="flex h-2.5 w-2.5 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                          )}
                          <p className={`text-sm font-bold truncate transition-colors ${selectedId === c.id ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'}`}>{c.title}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.category} • {new Date(c.submittedAt).toLocaleDateString()}</p>
                      </div>
                      {c.aiAnalysis ? (
                        <Tooltip content="AI Priority Score (0-100)" placement="left">
                          <div className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2 ${c.aiAnalysis.priorityScore > 80 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {c.aiAnalysis.priorityScore}
                          </div>
                        </Tooltip>
                      ) : (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-2" />
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3 pl-2">
                      <StatusBadge status={c.status} />
                      {c.aiAnalysis && <StatusBadge urgency={c.aiAnalysis.urgencyLevel} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detail & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {selectedComplaint ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-in fade-in duration-300">
              {/* Header Section */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-start gap-4 bg-white">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full text-lg font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none mb-2"
                      placeholder="Complaint Title"
                    />
                  ) : (
                    <h2 className="text-lg font-bold text-gray-900 leading-tight truncate mb-2">{selectedComplaint.title}</h2>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="font-mono text-gray-400">#{selectedComplaint.id.slice(0, 8)}</span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">{selectedComplaint.submittedBy}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(selectedComplaint.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {role === Role.OFFICIAL && (
                    <>
                      {isEditing ? (
                        <>
                          <Tooltip content="Save Changes" placement="top">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 rounded-lg border bg-green-50 border-green-200 text-green-600 hover:bg-green-100 transition-all"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Cancel Edit" placement="top">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="p-2 rounded-lg border bg-red-50 border-red-200 text-red-600 hover:bg-red-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip content="Edit Details" placement="top">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 rounded-lg border bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}

                      <Tooltip content="View photo evidence" placement="top">
                        <button
                          onClick={() => setIsPhotoModalOpen(true)}
                          className="p-2 rounded-lg border bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all relative"
                        >
                          <Image className="w-4 h-4" />
                          {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {selectedComplaint.photos.length}
                            </span>
                          )}
                        </button>
                      </Tooltip>

                      <Tooltip content="Flag for higher authority review" placement="top">
                        <button
                          onClick={() => toggleEscalation(selectedComplaint.id)}
                          className={`p-2 rounded-lg border transition-all ${selectedComplaint.isEscalated
                            ? 'bg-red-50 border-red-200 text-red-600 shadow-inner'
                            : 'bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                            }`}
                        >
                          <Flag className={`w-4 h-4 ${selectedComplaint.isEscalated ? 'fill-current' : ''}`} />
                        </button>
                      </Tooltip>

                      <Tooltip content="Flag as Spam/Troll" placement="top">
                        <button
                          onClick={() => updateStatus(selectedComplaint.id, ComplaintStatus.SPAM)}
                          className={`p-2 rounded-lg border transition-all ${selectedComplaint.status === ComplaintStatus.SPAM
                            ? 'bg-gray-100 border-gray-300 text-gray-600 shadow-inner'
                            : 'bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                            }`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </Tooltip>

                      <div className="relative group">
                        <select
                          value={selectedComplaint.status}
                          onChange={(e) => updateStatus(selectedComplaint.id, e.target.value as ComplaintStatus)}
                          className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wide rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <option value={ComplaintStatus.PENDING}>Pending</option>
                          <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                          <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                          <option value={ComplaintStatus.DISMISSED}>Dismissed</option>
                          <option value={ComplaintStatus.ON_HOLD}>On Hold</option>
                          <option value={ComplaintStatus.SPAM}>Spam</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-5 bg-white">
                {/* Description Section */}
                <div className="space-y-2">
                  {selectedComplaint.isEscalated && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3 items-start mb-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-red-100 p-1.5 rounded-md mt-0.5">
                        <Flag className="w-4 h-4 text-red-600 fill-current" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-900">Escalated Priority</h4>
                        <p className="text-xs text-red-700 mt-0.5">
                          This complaint has been flagged for immediate attention by senior officials.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedComplaint.aiAnalysis?.isTroll && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start mb-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-amber-100 p-1.5 rounded-md mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Potential Troll/Prank Detected</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          AI Analysis suggests this might be a non-serious submission: {selectedComplaint.aiAnalysis.trollAnalysis}
                        </p>
                      </div>
                    </div>
                  )}

                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Description
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap shadow-sm">
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Chips Row */}
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Location</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="text-xs font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-900 leading-tight">{selectedComplaint.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <Info className="w-3.5 h-3.5 text-purple-500" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Category</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="text-xs font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-900 leading-tight">{selectedComplaint.category}</span>
                      )}
                    </div>
                  </div>
                  {/* Contact Number Chip */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <div className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-[10px]">#</div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Contact</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.contactNumber}
                          onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                          className="text-xs font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                          placeholder="No contact info"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-900 leading-tight">
                          {selectedComplaint.contactNumber || 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Analysis Grid */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="mb-5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">✨ AI Intelligence Analysis</span>
                      <div className="px-2 py-0.5 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 text-[10px] font-bold rounded-full uppercase tracking-wide border border-violet-200">Beta</div>
                    </h3>
                    <p className="text-xs text-gray-500">AI-powered insights to help prioritize and understand this complaint</p>
                  </div>

                  {selectedComplaint.isAnalyzing ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 border-dashed animate-pulse">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                        <span className="text-sm font-medium text-gray-600">Analyzing complaint...</span>
                      </div>
                    </div>
                  ) : selectedComplaint.aiAnalysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Priority Card */}
                      <div className={`rounded-xl p-4 border-2 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all ${selectedComplaint.aiAnalysis.priorityScore >= 80 ? 'bg-red-50 border-red-200 hover:border-red-300' : selectedComplaint.aiAnalysis.priorityScore >= 50 ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-green-50 border-green-200 hover:border-green-300'}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${selectedComplaint.aiAnalysis.priorityScore >= 80 ? 'bg-red-500' : selectedComplaint.aiAnalysis.priorityScore >= 50 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                        <div className="pl-1">
                          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">Priority Score</p>
                          <div className="flex items-end gap-1.5 mb-3">
                            <span className={`text-4xl font-black leading-none ${selectedComplaint.aiAnalysis.priorityScore >= 80 ? 'text-red-600' : selectedComplaint.aiAnalysis.priorityScore >= 50 ? 'text-amber-600' : 'text-green-600'}`}>
                              {selectedComplaint.aiAnalysis.priorityScore}
                            </span>
                            <span className="text-sm font-semibold text-gray-500 mb-1">/ 100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${selectedComplaint.aiAnalysis.priorityScore >= 80 ? 'bg-red-500' : selectedComplaint.aiAnalysis.priorityScore >= 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${selectedComplaint.aiAnalysis.priorityScore}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Impact Card */}
                      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border-2 border-violet-200 shadow-sm hover:border-violet-300 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-violet-100 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-violet-600" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Impact Assessment</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {selectedComplaint.aiAnalysis.impactAnalysis}
                        </p>
                      </div>

                      {/* Action Card */}
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200 shadow-sm hover:border-teal-300 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Suggested Action</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {selectedComplaint.aiAnalysis.suggestedAction}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                      <p className="text-sm font-medium">AI Analysis unavailable for this complaint.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Select a complaint from the list to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedComplaint && (
        <PhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          photos={selectedComplaint.photos || []}
          complaintTitle={selectedComplaint.title}
        />
      )}

      {/* Manual Entry Modal */}
      <ManualComplaintModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onSubmit={handleManualSubmit}
      />
    </div>
  );
};

export default OfficialDashboard;