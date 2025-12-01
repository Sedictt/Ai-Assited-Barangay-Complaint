import React, { useState, useEffect, useRef } from 'react';
import { Calendar, AlertTriangle, Info, MapPin, Search, Filter, ChevronRight, ArrowRight, Bell } from './Icons';

// Utility hook for scroll animations
const useOnScreen = (options: IntersectionObserverInit) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect(); // Only animate once
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref, options]);

    return [ref, isVisible] as const;
};

const Announcements: React.FC = () => {
    const [filter, setFilter] = useState<'ALL' | 'NEWS' | 'EVENT' | 'EMERGENCY'>('ALL');
    const [heroRef, isHeroVisible] = useOnScreen({ threshold: 0.1 });

    // Mock Data with Images
    const announcements = [
        {
            id: 1,
            title: 'Typhoon Signal No. 2 Alert',
            date: 'Dec 01, 2024',
            type: 'EMERGENCY',
            content: 'Please be advised that Typhoon "Ambo" has intensified. Residents in low-lying areas are advised to prepare for possible evacuation. Emergency hotlines are open 24/7.',
            location: 'Barangay Wide',
            author: 'Barangay Captain',
            image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=2071&auto=format&fit=crop'
        },
        {
            id: 2,
            title: 'Free Medical Mission',
            date: 'Dec 05, 2024',
            type: 'EVENT',
            content: 'Join us for a free medical and dental mission at the Barangay Hall covered court. Services include check-ups, tooth extraction, and free vitamins.',
            location: 'Barangay Hall Complex',
            author: 'Health Committee',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop'
        },
        {
            id: 3,
            title: 'Garbage Collection Schedule Change',
            date: 'Nov 28, 2024',
            type: 'NEWS',
            content: 'Starting next week, garbage collection for Zone 1 will be moved to Tuesdays and Fridays. Please bring out your trash only on designated days.',
            location: 'Zone 1 & 2',
            author: 'Sanitation Dept',
            image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop'
        },
        {
            id: 4,
            title: 'Scheduled Power Interruption',
            date: 'Dec 10, 2024',
            type: 'NEWS',
            content: 'Meralco advisory: Power interruption from 8:00 AM to 5:00 PM due to line maintenance along Maysan Road.',
            location: 'Maysan Road Area',
            author: 'Admin',
            image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop'
        }
    ];

    const filteredAnnouncements = filter === 'ALL'
        ? announcements
        : announcements.filter(a => a.type === filter);

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'EMERGENCY': return 'bg-red-500 text-white shadow-red-500/30';
            case 'EVENT': return 'bg-amber-500 text-white shadow-amber-500/30';
            case 'NEWS': return 'bg-blue-500 text-white shadow-blue-500/30';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Section */}
            <section ref={heroRef} className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop"
                        alt="Bulletin Board"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-white"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 mt-10">
                    <div className={`transition-all duration-1000 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                            <Bell className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Community Updates</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold font-heading tracking-tight mb-6">
                            Digital Bulletin
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Stay connected and informed. The latest news, events, and advisories from Barangay Maysan.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-20">
                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    {['ALL', 'NEWS', 'EVENT', 'EMERGENCY'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 shadow-lg ${filter === f
                                ? 'bg-gray-900 text-white scale-105 shadow-gray-900/20'
                                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAnnouncements.map((item, index) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-8"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image Header */}
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${getBadgeColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-3">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {item.date}
                                </div>

                                <h3 className="text-xl font-bold font-heading text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                    {item.title}
                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                    {item.content}
                                </p>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        {item.location}
                                    </div>
                                    <button className="text-blue-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read More <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAnnouncements.length === 0 && (
                    <div className="text-center py-24 text-gray-400">
                        <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No announcements found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;
