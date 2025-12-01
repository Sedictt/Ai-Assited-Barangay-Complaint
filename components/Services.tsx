import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Shield, Building, Heart, MapPin, Info, Search, ArrowRight, CheckCircle } from './Icons';

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

interface ServiceSectionProps {
    section: any;
    index: number;
    navigate: any;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({ section, index, navigate }) => {
    const [ref, isVisible] = useOnScreen({ threshold: 0.2 });
    const isEven = index % 2 === 0;

    return (
        <section
            ref={ref}
            id={section.id}
            className={`relative w-full min-h-[700px] flex flex-col md:flex-row overflow-hidden group transition-colors duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent z-0 transform -translate-x-1/2"></div>

            {/* Content Side */}
            <div className={`w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 transition-all duration-1000 ease-out ${isEven ? 'md:order-1' : 'md:order-2'
                } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>

                <div className="max-w-lg mx-auto md:mx-0 relative">
                    {/* Floating Number/Index Background */}
                    <span className="absolute -top-20 -left-10 text-[10rem] font-bold text-gray-50 opacity-50 select-none pointer-events-none transition-transform duration-1000" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-20px)' }}>
                        0{index + 1}
                    </span>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color}`}></span>
                        {section.category}
                    </div>

                    <h2 className={`text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 leading-tight transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {section.title}
                    </h2>
                    <p className={`text-lg text-gray-600 mb-10 leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {section.description}
                    </p>

                    <div className="space-y-4">
                        {section.items.map((item: any, i: number) => (
                            <button
                                key={item.id}
                                onClick={() => navigate(`/services/${item.id}`)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-500 group/btn text-left transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                                style={{ transitionDelay: `${400 + (i * 100)}ms` }}
                            >
                                <div className={`p-3 rounded-xl bg-gray-50 text-gray-600 group-hover/btn:text-white group-hover/btn:bg-gradient-to-br ${section.color} transition-all duration-300 shadow-sm group-hover/btn:shadow-md`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <span className="block font-bold text-gray-900 text-lg group-hover/btn:text-blue-700 transition-colors">{item.label}</span>
                                    <span className="text-xs text-gray-500">Tap to request</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all duration-300 transform group-hover/btn:scale-110">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Side */}
            <div className={`w-full md:w-1/2 relative h-[500px] md:h-auto overflow-hidden ${isEven ? 'md:order-2' : 'md:order-1'
                }`}>
                <div className={`absolute inset-0 bg-gray-100 transition-transform duration-[1.5s] ease-in-out ${isVisible ? 'scale-100' : 'scale-110'}`}>
                    <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay Gradient for "Coherence" */}
                    <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r ${section.gradientDirection} from-white via-white/10 to-transparent opacity-100`}></div>

                    {/* Subtle animated particles/overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>
            </div>
        </section>
    );
};

const Services: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            id: 'certificates',
            category: 'Documentation',
            title: 'Certificates & Clearances',
            description: 'Secure your essential documents with ease. We’ve streamlined the process for Barangay Clearances, Indigency, and Residency certificates so you can focus on what matters most.',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop',
            color: 'from-blue-500 to-indigo-600',
            gradientDirection: 'md:from-white', // Fade from left (content side)
            items: [
                { id: 'clearance', label: 'Barangay Clearance', icon: <FileText className="w-5 h-5" /> },
                { id: 'indigency', label: 'Certificate of Indigency', icon: <Heart className="w-5 h-5" /> },
                { id: 'residency', label: 'Certificate of Residency', icon: <MapPin className="w-5 h-5" /> }
            ]
        },
        {
            id: 'business',
            category: 'Commerce',
            title: 'Business Support',
            description: 'Empowering local entrepreneurs. Whether you are starting a new venture or renewing your permits, we provide the regulatory support to keep your business running smoothly.',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
            color: 'from-emerald-500 to-teal-600',
            gradientDirection: 'md:to-white md:bg-gradient-to-l', // Fade from right (content side is on left for this one? No, wait. Even index = content left. Odd index = content right.)
            // Logic check: 
            // Index 0 (Even): Content Left, Image Right. Gradient should be on Image's Left edge (fading to transparent on right). So 'from-white'.
            // Index 1 (Odd): Content Right, Image Left. Gradient should be on Image's Right edge (fading to transparent on left). So 'to-white' isn't a direction. 
            // We need 'bg-gradient-to-l from-white' effectively.
            items: [
                { id: 'business-permit', label: 'Business Clearance', icon: <Building className="w-5 h-5" /> },
                { id: 'permit-renewal', label: 'Permit Renewal', icon: <FileText className="w-5 h-5" /> }
            ]
        },
        {
            id: 'safety',
            category: 'Security',
            title: 'Public Order & Safety',
            description: 'Your safety is our priority. Report incidents, file blotters, or request immediate assistance directly through our secure and confidential channels.',
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop',
            color: 'from-orange-500 to-red-600',
            gradientDirection: 'md:from-white', // Back to normal
            items: [
                { id: 'blotter', label: 'File a Blotter', icon: <Shield className="w-5 h-5" /> },
                { id: 'complaint', label: 'File Complaint', icon: <Info className="w-5 h-5" /> }
            ]
        }
    ];

    // Fix gradient logic for the map
    const processedSections = sections.map((s, i) => ({
        ...s,
        // If even (0, 2): Content Left, Image Right. Image needs fade on its LEFT. 'bg-gradient-to-r from-white'
        // If odd (1): Content Right, Image Left. Image needs fade on its RIGHT. 'bg-gradient-to-l from-white'
        gradientDirection: i % 2 === 0 ? 'from-white' : 'to-transparent md:bg-gradient-to-l md:from-white'
    }));

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[600px] flex items-center justify-center overflow-hidden pb-24">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover animate-pulse-slow" // Custom animation class or just standard
                        style={{ animationDuration: '10s' }}
                    />
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
                    {/* Animated background shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[100px] animate-blob"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500 blur-[100px] animate-blob animation-delay-2000"></div>
                    </div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                    <div className="inline-block mb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <span className="py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                            Official Portal
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-heading text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        E-Services
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Streamlined. Efficient. Transparent. <br />
                        Access all barangay services from the comfort of your home.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button onClick={() => document.getElementById('certificates')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                            Get Started
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                        <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll"></div>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="flex flex-col">
                {processedSections.map((section, index) => (
                    <ServiceSection key={section.id} section={section} index={index} navigate={navigate} />
                ))}
            </div>

            {/* Footer CTA */}
            <div className="bg-gray-900 py-32 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold font-heading text-white mb-6">Need assistance?</h2>
                    <p className="text-gray-400 mb-10 text-lg">
                        Our digital assistant is available 24/7 to guide you, or you can reach out to our support team directly.
                    </p>
                    <button onClick={() => navigate('/complaints/file')} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-600/25 hover:-translate-y-1">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Services;
