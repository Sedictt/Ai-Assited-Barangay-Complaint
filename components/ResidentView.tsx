import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintStatus, Role } from '../types';
import { analyzeComplaint } from '../services/geminiService';
import StatusBadge from './StatusBadge';
import { FileText, MapPin, Loader2, Lock, Info, Send, Clock, CheckCircle, Activity, ChevronRight, Sparkles } from './Icons';
import Tooltip from './Tooltip';

interface ResidentViewProps {
    complaints: Complaint[];
    addComplaint: (c: Complaint) => void;
    role: Role;
}

const ResidentView: React.FC<ResidentViewProps> = ({ complaints, addComplaint, role }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Sanitation');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newComplaint: Complaint = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            location,
            category,
            submittedBy: "Juan Dela Cruz (Resident)",
            submittedAt: new Date().toISOString(),
            status: ComplaintStatus.PENDING,
            isAnalyzing: true,
        };

        // Optimistic UI Update
        addComplaint(newComplaint);

        // Simulate submission delay for UX
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            // Clear form
            setTitle('');
            setDescription('');
            setLocation('');

            // Hide success message after 3s
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);

        // Perform AI Analysis in background
        try {
            const analysis = await analyzeComplaint(title, description, location, category);
            addComplaint({ ...newComplaint, aiAnalysis: analysis, isAnalyzing: false });
        } catch (err) {
            console.error(err);
            addComplaint({ ...newComplaint, isAnalyzing: false });
        }
    };

    const myComplaints = complaints.filter(c => c.submittedBy.includes("Resident"));

    const stats = useMemo(() => {
        return {
            total: myComplaints.length,
            resolved: myComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
            pending: myComplaints.filter(c => c.status === ComplaintStatus.PENDING).length
        };
    }, [myComplaints]);

    return (
        <div className="space-y-8">
            {/* Stunning Hero Section with Gradient */}
            <div className="gradient-purple rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden animate-fade-in-up">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" style={{ animationdelay: '1s' }}></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 animate-pulse" />
                            Welcome, Resident!
                        </h1>
                        <p className="text-purple-100 text-lg leading-relaxed">
                            Your voice matters. Help us build a better Barangay Maysan by reporting issues in our community. Every report is analyzed by AI and prioritized for action.
                        </p>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <div className="glass-strong backdrop-blur-xl rounded-2xl p-5 flex items-center gap-4 border border-white/30 min-w-[160px] hover-lift">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{stats.total}</p>
                                <p className="text-xs text-purple-200 uppercase font-semibold tracking-wide">Submitted</p>
                            </div>
                        </div>
                        <div className="glass-strong backdrop-blur-xl rounded-2xl p-5 flex items-center gap-4 border border-white/30 min-w-[160px] hover-lift">
                            <div className="bg-emerald-400/30 p-3 rounded-xl">
                                <CheckCircle className="w-7 h-7 text-emerald-100" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{stats.resolved}</p>
                                <p className="text-xs text-purple-200 uppercase font-semibold tracking-wide">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Glass morphic Form Section */}
                <div className="lg:col-span-1 animate-scale-in">
                    <div className="glass-card rounded-2xl shadow-2xl border border-white/30 sticky top-24 overflow-hidden hover-lift">
                        <div className="gradient-teal px-6 py-5 border-b border-white/20 flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Send className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-lg font-bold text-white">📝 File a New Report</h2>
                        </div>

                        <div className="p-6">
                            {showSuccess ? (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-10 text-center animate-scale-in">
                                    <div className="w-20 h-20 gradient-teal text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Success! 🎉</h3>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Your complaint has been queued for AI analysis. Track its status in the history panel below.
                                    </p>
                                    <button
                                        onClick={() => setShowSuccess(false)}
                                        className="gradient-purple text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg btn-shine"
                                    >
                                        File Another Report
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-gray-800">📌 What's the issue?</label>
                                            <Tooltip content="Brief summary: 'Flooded Road', 'Broken Light', etc.">
                                                <Info className="w-4 h-4 text-gray-400 hover:text-purple-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Uncollected Garbage Pile"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus-glow focus:border-purple-500 outline-none transition-all text-sm font-medium hover:border-gray-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-800">🏷️ Category</label>
                                        <div className="relative">
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus-glow focus:border-purple-500 outline-none transition-all appearance-none text-sm font-medium bg-white hover:border-gray-300"
                                            >
                                                <option>Sanitation</option>
                                                <option>Infrastructure/Roads</option>
                                                <option>Peace and Order</option>
                                                <option>Health</option>
                                                <option>Others</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                                <ChevronRight className="w-5 h-5 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-gray-800">📍 Location</label>
                                            <Tooltip content="Include street names or landmarks.">
                                                <Info className="w-4 h-4 text-gray-400 hover:text-purple-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="e.g., Purok 3, Near Basketball Court"
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus-glow focus:border-purple-500 outline-none transition-all text-sm font-medium hover:border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-800">📄 Description</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe what happened, when it started, and how urgent it feels..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus-glow focus:border-purple-500 outline-none transition-all text-sm resize-none hover:border-gray-300"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full gradient-purple text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] btn-shine"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Submit Report</span>
                                                    <Send className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-4">
                                            🔒 By submitting, you agree to our data privacy policy
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Section with Enhanced Cards */}
                <div className="lg:col-span-2 space-y-5 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="w-6 h-6 text-purple-300" />
                        Your Activity History
                    </h2>

                    <div className="space-y-4">
                        {myComplaints.length === 0 ? (
                            <div className="glass-card rounded-2xl border-2 border-dashed border-white/20 p-16 text-center">
                                <div className="glass p-5 rounded-full mb-6 w-20 h-20 flex items-center justify-center mx-auto">
                                    <FileText className="w-10 h-10 text-white/60" />
                                </div>
                                <p className="text-white/80 font-semibold text-xl mb-2">No reports yet</p>
                                <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
                                    Use the form on the left to submit your first report and help improve our community
                                </p>
                            </div>
                        ) : (
                            myComplaints.map((c) => (
                                <div key={c.id} className="group glass-card rounded-2xl shadow-lg border border-white/20 hover:border-purple-300/50 hover:shadow-2xl transition-all duration-300 overflow-hidden hover-lift">
                                    <div className="p-6 flex flex-col sm:flex-row gap-5">
                                        {/* Status Column */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:w-28 shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-5">
                                            <div className="text-center sm:text-left">
                                                <span className="block text-xs text-gray-500 font-semibold uppercase mb-2">Status</span>
                                                <StatusBadge status={c.status} />
                                            </div>
                                            {c.isAnalyzing ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 mt-2">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                                    <span className="text-[11px] font-bold text-blue-600">AI Analyzing</span>
                                                </div>
                                            ) : (
                                                <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 mt-3">
                                                    <Clock className="w-3.5 h-3.5" /> Updated
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-purple-600 transition-colors">
                                                    {c.title}
                                                </h3>
                                                <Tooltip content="Only officials can update status" placement="bottom">
                                                    <Lock className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors cursor-help" />
                                                </Tooltip>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{c.description}</p>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{c.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                    <span className="font-medium text-purple-700">{c.category}</span>
                                                </div>
                                                <span className="text-gray-400 ml-auto font-medium">{new Date(c.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Analysis Footer */}
                                    {!c.isAnalyzing && c.aiAnalysis && (
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-t border-purple-100/50 flex flex-wrap items-center gap-4 text-xs">
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <div className={`w-2.5 h-2.5 rounded-full ${c.aiAnalysis.urgencyLevel === 'CRITICAL' ? 'bg-red-500 animate-pulse' : c.aiAnalysis.urgencyLevel === 'HIGH' ? 'bg-orange-500' : c.aiAnalysis.urgencyLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                                <Sparkles className="w-4 h-4 text-purple-500" />
                                                AI Priority: <span className="text-purple-700 font-bold">{c.aiAnalysis.urgencyLevel}</span>
                                            </div>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-600 truncate max-w-md flex-1">
                                                {c.aiAnalysis.impactAnalysis}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentView;
