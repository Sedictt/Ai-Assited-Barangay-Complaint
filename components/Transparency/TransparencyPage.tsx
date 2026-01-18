import React, { useState } from 'react';
import ProjectTracker from './ProjectTracker';
import { FileText, TrendingUp, DollarSign, Calendar, Download, ChevronRight, PieChart } from '../Icons';

const TransparencyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'PROJECTS' | 'FINANCIALS' | 'DOCUMENTS'>('PROJECTS');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-green-900 text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400 opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <FileText className="w-4 h-4 text-emerald-300" />
                        <span className="text-xs font-medium tracking-wide uppercase text-emerald-100">Open Governance</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-heading animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Transparency & Accountability
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Access financial reports, track infrastructure projects, and review official documents. We are committed to serving with integrity.
                    </p>
                </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Metric 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 hover:transform hover:-translate-y-1 transition-all duration-300">
                        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">2024 Budget Allocation</p>
                            <h3 className="text-2xl font-bold text-gray-900">₱ 12,500,000</h3>
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +5.2% from last year
                            </p>
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 hover:transform hover:-translate-y-1 transition-all duration-300">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Completion</p>
                            <h3 className="text-2xl font-bold text-gray-900">85%</h3>
                            <p className="text-xs text-blue-600 font-medium">
                                12 Projects Completed
                            </p>
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 hover:transform hover:-translate-y-1 transition-all duration-300">
                        <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Council Meeting</p>
                            <h3 className="text-2xl font-bold text-gray-900">Dec 15, 2024</h3>
                            <p className="text-xs text-gray-500 font-medium">
                                2:00 PM @ Barangay Hall
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab('PROJECTS')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'PROJECTS'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Infrastructure Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('FINANCIALS')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'FINANCIALS'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Financial Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('DOCUMENTS')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'DOCUMENTS'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Official Documents
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'PROJECTS' && (
                        <ProjectTracker />
                    )}

                    {activeTab === 'FINANCIALS' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-8 border-b border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Annual Budget Breakdown (2024)</h2>
                                    <p className="text-gray-500">Detailed allocation of barangay funds across key sectors.</p>
                                </div>
                                <div className="p-8">
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Infrastructure & Public Works', amount: '₱ 5,000,000', percent: '40%', color: 'bg-teal-500' },
                                            { label: 'Health & Sanitation', amount: '₱ 3,125,000', percent: '25%', color: 'bg-blue-500' },
                                            { label: 'Disaster Risk Reduction', amount: '₱ 1,875,000', percent: '15%', color: 'bg-amber-500' },
                                            { label: 'Peace & Order', amount: '₱ 1,250,000', percent: '10%', color: 'bg-red-500' },
                                            { label: 'Administrative & Others', amount: '₱ 1,250,000', percent: '10%', color: 'bg-gray-400' },
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                                    <span>{item.label}</span>
                                                    <span>{item.amount} ({item.percent})</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.percent }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-center">
                                    <button className="flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors">
                                        <Download className="w-4 h-4" />
                                        Download Full Financial Report (PDF)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'DOCUMENTS' && (
                        <div className="max-w-4xl mx-auto grid gap-4">
                            {[
                                { title: 'Barangay Annual Report 2023', date: 'Jan 15, 2024', size: '2.4 MB', type: 'PDF' },
                                { title: 'Q1 2024 Financial Statement', date: 'Apr 10, 2024', size: '1.1 MB', type: 'PDF' },
                                { title: 'Disaster Management Plan 2024', date: 'Feb 01, 2024', size: '5.6 MB', type: 'PDF' },
                                { title: 'Resolution No. 24-001: Street Lighting', date: 'Mar 05, 2024', size: '0.8 MB', type: 'PDF' },
                                { title: 'Barangay Development Plan 2024-2026', date: 'Jan 20, 2024', size: '8.2 MB', type: 'PDF' },
                            ].map((doc, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-100 transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{doc.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Uploaded: {doc.date} • {doc.size}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-teal-600 transition-colors">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransparencyPage;
