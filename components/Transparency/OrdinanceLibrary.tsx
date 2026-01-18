import React, { useEffect, useState } from 'react';
import { Ordinance } from '../../types';
import { subscribeToOrdinances } from '../../services/firestoreService';
import { BookOpen, Search, FileText, ChevronRight } from '../Icons';

const OrdinanceLibrary: React.FC = () => {
    const [ordinances, setOrdinances] = useState<Ordinance[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [selectedOrdinance, setSelectedOrdinance] = useState<Ordinance | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToOrdinances((data) => {
            setOrdinances(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const categories = ['ALL', ...Array.from(new Set(ordinances.map(o => o.category)))];

    const filteredOrdinances = ordinances.filter(ord => {
        const matchesSearch = ord.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ord.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || ord.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading ordinances...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-green-900 text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400 opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <BookOpen className="w-4 h-4 text-emerald-300" />
                        <span className="text-xs font-medium tracking-wide uppercase text-emerald-100">Legislative Corner</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-heading animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Ordinance Library
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Know your rights and responsibilities. Access the complete collection of Barangay Maysan's official ordinances and resolutions.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 -mt-8 relative z-20">
                {/* Search & Filter */}
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 mb-8 sticky top-24 z-30 transition-all duration-300 hover:shadow-xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search ordinances (e.g., 'Curfew', 'Parking')..."
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${selectedCategory === cat
                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 transform scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-6">
                    {filteredOrdinances.length === 0 ? (
                        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No ordinances found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your search terms or filters.</p>
                        </div>
                    ) : (
                        filteredOrdinances.map((ord, index) => (
                            <div
                                key={ord.id}
                                onClick={() => setSelectedOrdinance(ord)}
                                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-teal-100">
                                                {ord.category}
                                            </span>
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                Enacted: {new Date(ord.dateEnacted).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors leading-tight">
                                            {ord.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-700">
                                            {ord.summary}
                                        </p>
                                    </div>
                                    <div className="self-center p-3 bg-gray-50 rounded-full group-hover:bg-teal-50 group-hover:text-teal-600 transition-all transform group-hover:translate-x-1">
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {selectedOrdinance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {selectedOrdinance.category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ID: {selectedOrdinance.id}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                    {selectedOrdinance.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedOrdinance(null)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal-600" />
                                    Summary
                                </h3>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {selectedOrdinance.summary}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-teal-600" />
                                    Full Text
                                </h3>
                                <div className="text-gray-500 italic text-sm bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                    <p className="mb-2">
                                        The full digital text for this {selectedOrdinance.category.toLowerCase()} is currently being digitized.
                                    </p>
                                    <p>
                                        For the official hard copy, please visit the Barangay Secretariat or check the
                                        <a
                                            href="https://www.valenzuela.gov.ph/ordinances"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-600 hover:text-teal-700 font-medium ml-1 underline"
                                        >
                                            Valenzuela City Ordinances & Resolutions
                                        </a> page.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                                <div>
                                    <span className="font-medium text-gray-900">Date Enacted:</span>
                                    <span className="ml-2">{new Date(selectedOrdinance.dateEnacted).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedOrdinance(null)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdinanceLibrary;
