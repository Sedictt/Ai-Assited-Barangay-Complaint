import React, { useEffect, useState } from 'react';
import { Project } from '../../types';
import { subscribeToProjects } from '../../services/firestoreService';
import { HardHat, Calendar, CheckCircle, Clock, AlertTriangle } from '../Icons';

const ProjectTracker: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToProjects((data) => {
            setProjects(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading projects...</div>;

    return (
        <div className="max-w-5xl mx-auto">


            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-500/0 before:via-teal-200 before:to-teal-500/0">
                {projects.map((project, index) => (
                    <div
                        key={project.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-teal-50 to-emerald-50 shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:scale-110 transition-transform duration-500">
                            {project.status === 'COMPLETED' ? (
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            ) : project.status === 'DELAYED' ? (
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            ) : (
                                <HardHat className="w-6 h-6 text-teal-600" />
                            )}
                        </div>

                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:border-teal-100 transition-all duration-500 group-hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                    project.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                                        project.status === 'DELAYED' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'
                                    }`}>
                                    {project.status}
                                </span>
                                <span className="text-sm font-black text-gray-300 group-hover:text-teal-500 transition-colors">
                                    {project.progress}%
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-teal-700 transition-colors">{project.title}</h3>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{project.description}</p>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${project.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                        project.status === 'DELAYED' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                            'bg-gradient-to-r from-blue-400 to-teal-500'
                                        }`}
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
                                <div>
                                    <p className="uppercase tracking-wider font-bold text-[10px] text-gray-400 mb-1">Budget</p>
                                    <p className="font-bold text-gray-900 text-sm">{project.budget}</p>
                                </div>
                                <div>
                                    <p className="uppercase tracking-wider font-bold text-[10px] text-gray-400 mb-1">Contractor</p>
                                    <p className="font-bold text-gray-900 text-sm">{project.contractor}</p>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 mt-1 bg-gray-50 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-teal-500" />
                                    <span className="font-medium text-gray-700">
                                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectTracker;
