import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, FileText, Search, Users, Phone, Mail, MapPin, Calendar, Info, ChevronRight, Shield, Heart, ArrowRight } from './Icons';

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

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [heroRef, isHeroVisible] = useOnScreen({ threshold: 0.1 });
    const [aboutRef, isAboutVisible] = useOnScreen({ threshold: 0.2 });
    const [servicesRef, isServicesVisible] = useOnScreen({ threshold: 0.1 });
    const [newsRef, isNewsVisible] = useOnScreen({ threshold: 0.1 });

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Section */}
            <section ref={heroRef} className="relative h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-gray-900 text-white pb-32">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero-placeholder.png"
                        alt="Barangay Maysan"
                        className="w-full h-full object-cover animate-pulse-slow"
                        style={{ animationDuration: '15s' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/90 backdrop-blur-[2px]"></div>

                    {/* Animated background shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600 blur-[120px] animate-blob"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600 blur-[120px] animate-blob animation-delay-2000"></div>
                        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-500 blur-[100px] animate-blob animation-delay-4000"></div>
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className={`transition-all duration-1000 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 hover:bg-white/20 transition-colors cursor-default">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Official Barangay Portal</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight leading-tight mb-8">
                            Welcome to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-white">Barangay Maysan</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
                            Experience a modern, transparent, and efficient local government.
                            Access services, file reports, and stay connected with your community.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => navigate('/complaints/file')}
                                className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                            >
                                <FileText className="w-5 h-5" />
                                File a Complaint
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/track')}
                                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                Track Status
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50 cursor-pointer" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                        <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll"></div>
                    </div>
                </div>
            </section>

            {/* About / Introduction Section (Z-Layout Style) */}
            <section id="about" ref={aboutRef} className="relative py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        {/* Text Content */}
                        <div className={`w-full md:w-1/2 transition-all duration-1000 ${isAboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                                <Building className="w-3 h-3" />
                                About Us
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 leading-tight">
                                Empowering the Community Through Technology
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Barangay Maysan is committed to providing efficient, transparent, and accessible public services. Our new digital portal allows you to interact with barangay officials, request documents, and report issues from the comfort of your home.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                We believe in a proactive approach to governance, where every resident's voice is heard and every concern is addressed promptly.
                            </p>
                            <button onClick={() => navigate('/services')} className="group flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
                                Explore Our Services
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Image Content */}
                        <div className={`w-full md:w-1/2 relative transition-all duration-1000 delay-200 ${isAboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                                <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors z-10"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop"
                                    alt="Community"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-100 rounded-full -z-10 blur-xl"></div>
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-100 rounded-full -z-10 blur-xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Services Grid (Premium Style) */}
            <section ref={servicesRef} className="py-24 bg-gray-50 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className={`text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4 transition-all duration-700 ${isServicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Essential Services
                        </h2>
                        <p className={`text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${isServicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Quick access to the most frequently used barangay services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Report Issue',
                                desc: 'Submit complaints about sanitation, roads, or safety.',
                                icon: <Shield className="w-6 h-6" />,
                                color: 'text-blue-600 bg-blue-50',
                                link: '/complaints/file',
                                action: 'File Report'
                            },
                            {
                                title: 'Track Status',
                                desc: 'Monitor the progress of your submitted reports.',
                                icon: <Search className="w-6 h-6" />,
                                color: 'text-indigo-600 bg-indigo-50',
                                link: '/track',
                                action: 'Check Status'
                            },
                            {
                                title: 'E-Services',
                                desc: 'Request Barangay Clearance and other documents.',
                                icon: <FileText className="w-6 h-6" />,
                                color: 'text-purple-600 bg-purple-50',
                                link: '/services',
                                action: 'Request Now'
                            },
                            {
                                title: 'Community Map',
                                desc: 'Locate health centers and evacuation sites.',
                                icon: <MapPin className="w-6 h-6" />,
                                color: 'text-pink-600 bg-pink-50',
                                link: '/map',
                                action: 'View Map'
                            }
                        ].map((service, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(service.link)}
                                className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer group transform hover:-translate-y-2 ${isServicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{service.desc}</p>
                                <div className="flex items-center text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {service.action} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Updates (News) */}
            <section ref={newsRef} className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold font-heading text-gray-900">Latest Updates</h2>
                            <p className="text-gray-500 mt-2">Stay informed with the latest news and announcements.</p>
                        </div>
                        <button onClick={() => navigate('/announcements')} className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">
                            View All Updates <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                type: 'News',
                                date: 'Oct 24, 2024',
                                title: 'Barangay Clean-up Drive Schedule',
                                desc: "Join us this coming Saturday for our monthly community clean-up drive. Let's keep Maysan clean and green!",
                                image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=2071&auto=format&fit=crop',
                                color: 'bg-blue-600'
                            },
                            {
                                type: 'Event',
                                date: 'Nov 01, 2024',
                                title: 'Free Medical Mission',
                                desc: 'Free check-ups and medicine distribution at the Barangay Hall covered court. Starts at 8:00 AM.',
                                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
                                color: 'bg-amber-500'
                            },
                            {
                                type: 'Advisory',
                                date: 'Nov 05, 2024',
                                title: 'Road Maintenance Advisory',
                                desc: 'Please be advised of the ongoing road maintenance along Maysan Road. Expect light traffic.',
                                image: 'https://images.unsplash.com/photo-1584463673574-a70c16058a0e?q=80&w=2069&auto=format&fit=crop',
                                color: 'bg-green-600'
                            }
                        ].map((news, index) => (
                            <div
                                key={index}
                                onClick={() => navigate('/announcements')}
                                className={`group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 ${isNewsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="h-56 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`${news.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                                            {news.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-3">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {news.date}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                        {news.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                                        {news.desc}
                                    </p>
                                    <div className="flex items-center text-blue-600 font-bold text-sm group-hover:gap-2 transition-all mt-auto">
                                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <button onClick={() => navigate('/announcements')} className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">
                            View All Updates <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Emergency Hotlines (Footer Style) */}
            <section className="py-16 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold font-heading mb-3">Emergency Hotlines</h2>
                            <p className="text-gray-400">Save these numbers. Help is just a call away.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="bg-red-500 p-3 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Emergency Response</p>
                                    <p className="text-2xl font-bold tracking-widest font-mono">911</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="bg-blue-500 p-3 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Building className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Barangay Hall</p>
                                    <p className="text-2xl font-bold tracking-widest font-mono">(02) 8123-4567</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
