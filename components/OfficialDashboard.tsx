import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintStatus, UrgencyLevel, Role } from '../types';
import StatusBadge from './StatusBadge';
import { AlertTriangle, TrendingUp, CheckCircle, Users, Loader2, MapPin, Filter, Calendar, Lock, FileText, Info, Flag, Activity } from './Icons';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import Tooltip from './Tooltip';

interface OfficialDashboardProps {
  complaints: Complaint[];
  updateStatus: (id: string, status: ComplaintStatus) => void;
  toggleEscalation: (id: string) => void;
  role: Role;
}

const OfficialDashboard: React.FC<OfficialDashboardProps> = ({ complaints, updateStatus, toggleEscalation, role }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selectedComplaint = complaints.find(c => c.id === selectedId);

  // Stats calculation (Based on TOTAL complaints, not filtered)
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === ComplaintStatus.PENDING).length,
      critical: complaints.filter(c => c.aiAnalysis?.urgencyLevel === UrgencyLevel.CRITICAL && c.status !== ComplaintStatus.RESOLVED).length,
      resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
      residentSubmissions: complaints.filter(c => c.submittedBy.toLowerCase().includes('resident')).length,
    };
  }, [complaints]);

  // Chart Data: Full Status Breakdown
  const chartData = useMemo(() => [
    { name: 'Pending', value: complaints.filter(c => c.status === ComplaintStatus.PENDING).length, color: '#f59e0b' }, // Amber
    { name: 'In Progress', value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, color: '#3b82f6' }, // Blue
    { name: 'Resolved', value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, color: '#22c55e' }, // Green
    { name: 'Dismissed', value: complaints.filter(c => c.status === ComplaintStatus.DISMISSED).length, color: '#94a3b8' }, // Gray
  ].filter(item => item.value > 0), [complaints]);

  const getPriorityBarColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <Tooltip content="The total number of complaints currently in the system database." placement="bottom">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 cursor-help">
              <Users className="w-6 h-6" />
            </div>
          </Tooltip>
          <div>
            <p className="text-sm text-gray-500">Total Complaints</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <Tooltip content="Complaints marked 'Critical' by AI that are not yet resolved." placement="bottom">
            <div className="p-3 bg-red-100 rounded-full text-red-600 animate-pulse cursor-help">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </Tooltip>
          <div>
            <p className="text-sm text-gray-500">Critical Issues</p>
            <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <Tooltip content="Complaints that have been successfully closed." placement="bottom">
            <div className="p-3 bg-green-100 rounded-full text-green-600 cursor-help">
              <CheckCircle className="w-6 h-6" />
            </div>
          </Tooltip>
          <div>
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <Tooltip content="Complaints waiting for initial review or action." placement="bottom">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600 cursor-help">
                <TrendingUp className="w-6 h-6" />
              </div>
            </Tooltip>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 flex items-center gap-4 ring-1 ring-purple-100">
            <Tooltip content="Complaints submitted directly by residents via the app." placement="bottom">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600 cursor-help">
                <FileText className="w-6 h-6" />
              </div>
            </Tooltip>
            <div>
              <p className="text-sm text-gray-500">Resident Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.residentSubmissions}</p>
            </div>
        </div>
      </div>

      {/* Toolbar: Filter & Sort */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
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
                 className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
               className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={urgencyFilter}
               onChange={(e) => setUrgencyFilter(e.target.value)}
            >
               <option value="ALL">All Urgencies</option>
               {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
            </select>

            {/* Filter by Category */}
            <select 
               className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                 className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value as any)}
               >
                 <option value="PRIORITY">AI Priority Score</option>
                 <option value="DATE_DESC">Date (Newest)</option>
                 <option value="DATE_ASC">Date (Oldest)</option>
               </select>
            </div>
            
            {/* Restricted Add Button */}
            <Tooltip content="Restricted: Only Residents can file complaints." placement="bottom">
              <button 
                  disabled={true} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed opacity-75 border border-gray-200 ml-2 whitespace-nowrap"
              >
                 <Lock className="w-4 h-4" /> New Complaint
              </button>
            </Tooltip>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-1 bg-slate-100 rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[650px] ring-1 ring-black/5">
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

          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center z-10 relative">
            <div>
                <h3 className="font-bold text-gray-900">Complaints Queue</h3>
                <p className="text-xs text-gray-500 mt-1">
                    {filteredComplaints.length} result{filteredComplaints.length !== 1 ? 's' : ''}
                </p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            {filteredComplaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-gray-400 text-sm">No complaints match the selected filters.</p>
                    <button 
                        onClick={() => { setStatusFilter('ALL'); setUrgencyFilter('ALL'); setCategoryFilter('ALL'); }}
                        className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                filteredComplaints.map(c => (
                <div 
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all border shadow-sm group ${selectedId === c.id ? 'bg-white border-blue-600 ring-1 ring-blue-600 shadow-md scale-[1.01]' : 'bg-white border-transparent hover:border-blue-300 hover:shadow-md'}`}
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
                        <p className={`text-sm font-bold truncate ${selectedId === c.id ? 'text-blue-700' : 'text-gray-900'}`}>{c.title}</p>
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
                ))
            )}
          </div>
        </div>

        {/* Right Column: Detail & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
           {/* Enhanced Chart Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                   <h3 className="font-semibold text-gray-900">Current Status Overview</h3>
                   <p className="text-sm text-gray-500">Distribution of complaints by status</p>
                </div>
              </div>
              
              <div className="h-64 w-full">
                 {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
                            />
                            <Legend 
                                verticalAlign="middle" 
                                align="right"
                                layout="vertical"
                                iconType="circle"
                                wrapperStyle={{ paddingLeft: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                        <TrendingUp className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No complaints recorded yet</p>
                    </div>
                 )}
              </div>
          </div>

          {selectedComplaint ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedComplaint.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">Submitted by {selectedComplaint.submittedBy} on {new Date(selectedComplaint.submittedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Status & Action Area */}
                  <div className="flex items-center gap-3">
                    {role === Role.OFFICIAL ? (
                        <>
                           {/* Escalation Button */}
                            <Tooltip content="Flag this complaint for higher authority review." placement="top">
                                <button
                                    onClick={() => toggleEscalation(selectedComplaint.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                                        selectedComplaint.isEscalated
                                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 shadow-inner'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    <Flag className={`w-4 h-4 ${selectedComplaint.isEscalated ? 'fill-current' : ''}`} />
                                    {selectedComplaint.isEscalated ? 'Escalated' : 'Escalate'}
                                </button>
                            </Tooltip>

                            {/* Status Dropdown */}
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Update Status</span>
                                <div className="relative">
                                <select
                                    value={selectedComplaint.status}
                                    onChange={(e) => updateStatus(selectedComplaint.id, e.target.value as ComplaintStatus)}
                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors cursor-pointer ${
                                    selectedComplaint.status === ComplaintStatus.PENDING ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                                    selectedComplaint.status === ComplaintStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                    selectedComplaint.status === ComplaintStatus.RESOLVED ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                    'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                >
                                    <option value={ComplaintStatus.PENDING}>Pending</option>
                                    <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                                    <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                                    <option value={ComplaintStatus.DISMISSED}>Dismissed</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                                </div>
                            </div>
                      </>
                    ) : (
                      <StatusBadge status={selectedComplaint.status} />
                    )}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                     {selectedComplaint.isEscalated && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in">
                            <Flag className="w-5 h-5 text-red-600 mt-0.5 fill-current" />
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Escalated to Higher Authority</h4>
                                <p className="text-xs text-red-700 mt-1">
                                    This complaint has been flagged for immediate review by city hall/senior officials.
                                </p>
                            </div>
                        </div>
                     )}

                     <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Complaint Details</h3>
                     <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400">Description</label>
                          <p className="text-gray-800">{selectedComplaint.description}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Location</label>
                          <p className="text-gray-800 flex items-center gap-1">
                             <MapPin className="w-4 h-4 text-gray-400" /> {selectedComplaint.location}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Category</label>
                          <p className="text-gray-800">{selectedComplaint.category}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                       <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-2">
                         ✨ AI Analysis
                         <Tooltip content="Confidence level depends on the detail provided. The system is calibrated for Barangay Maysan's specific context." placement="top">
                            <Info className="w-4 h-4 text-purple-400 cursor-help" />
                         </Tooltip>
                       </h3>
                       {selectedComplaint.aiAnalysis && selectedComplaint.aiAnalysis.confidenceScore !== undefined && (
                            <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                <div className="text-right">
                                    <p className="text-[10px] text-purple-500 uppercase font-bold leading-none">Confidence</p>
                                    <p className="text-sm font-bold text-purple-700 leading-none">{selectedComplaint.aiAnalysis.confidenceScore}%</p>
                                </div>
                                <div className="relative w-8 h-8 flex-shrink-0">
                                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                                        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" className="text-purple-200" />
                                        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" className="text-purple-600" 
                                            strokeDasharray={2 * Math.PI * 12}
                                            strokeDashoffset={2 * Math.PI * 12 * (1 - selectedComplaint.aiAnalysis.confidenceScore / 100)}
                                            strokeLinecap="round"
                                        />
                                     </svg>
                                </div>
                            </div>
                       )}
                    </div>
                     
                     {selectedComplaint.isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <p>Analyzing content...</p>
                        </div>
                     ) : selectedComplaint.aiAnalysis ? (
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600">Priority Score</span>
                                <Tooltip content="0-100 score calculated based on urgency keywords, location, and category.">
                                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-red-500" 
                                      style={{ width: `${selectedComplaint.aiAnalysis.priorityScore}%` }}
                                   />
                                </div>
                                <span className="font-bold text-gray-900">{selectedComplaint.aiAnalysis.priorityScore}/100</span>
                              </div>
                           </div>

                           <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                             <div className="flex items-center gap-1 mb-1">
                               <p className="text-xs text-purple-600 font-semibold">Impact Analysis</p>
                               <Tooltip content="AI prediction of potential consequences if this issue is not addressed immediately.">
                                  <Info className="w-3 h-3 text-purple-400 cursor-help" />
                               </Tooltip>
                             </div>
                             <p className="text-sm text-gray-700">{selectedComplaint.aiAnalysis.impactAnalysis}</p>
                           </div>

                           {/* Suggested Action - Highlighted */}
                           <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 shadow-sm">
                             <div className="flex items-center gap-1 mb-1">
                               <Activity className="w-3.5 h-3.5 text-teal-600" />
                               <p className="text-xs text-teal-700 font-bold uppercase tracking-wide">Suggested Action</p>
                               <Tooltip content="Recommended first steps for the barangay tanods or officials.">
                                  <Info className="w-3 h-3 text-teal-500 cursor-help" />
                               </Tooltip>
                             </div>
                             <p className="text-sm text-gray-800 font-medium leading-relaxed">{selectedComplaint.aiAnalysis.suggestedAction}</p>
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-2 rounded border border-gray-100">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    Resource Intensity
                                    <Tooltip content="Estimated manpower or cost required (Low/Medium/High).">
                                        <Info className="w-3 h-3 text-gray-300 cursor-help" />
                                    </Tooltip>
                                </span>
                                <span className="text-sm font-medium text-gray-800">{selectedComplaint.aiAnalysis.estimatedResourceIntensity}</span>
                              </div>
                              <div className="bg-white p-2 rounded border border-gray-100">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    AI Category
                                    <Tooltip content="The AI verifies if the resident selected the correct category.">
                                        <Info className="w-3 h-3 text-gray-300 cursor-help" />
                                    </Tooltip>
                                </span>
                                <span className="text-sm font-medium text-gray-800">{selectedComplaint.aiAnalysis.categoryCorrection || "Same"}</span>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <p className="text-sm text-gray-500">Analysis unavailable.</p>
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
    </div>
  );
};

export default OfficialDashboard;