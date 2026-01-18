import React, { useEffect, useState } from 'react';
import { Job } from '../../types';
import { subscribeToJobs } from '../../services/firestoreService';
import { Briefcase, MapPin, Clock, Search } from '../Icons';

const JobBoard: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToJobs((data) => {
            setJobs(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading jobs...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Job Opportunities</h2>
                    <p className="text-gray-500">Find local employment and "Cash for Work" programs.</p>
                </div>
                <button className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Post a Job
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job, index) => (
                    <div
                        key={job.id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                                {job.employer.charAt(0)}
                            </div>
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-gray-100">
                                {job.type.replace('_', ' ')}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">{job.title}</h3>
                        <p className="text-sm text-gray-500 font-medium mb-6">{job.employer}</p>

                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span>Maysan, Valenzuela</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-semibold text-gray-900">{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 mt-auto">
                            <button className="w-full py-2.5 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 group-hover:shadow-sm">
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobBoard;
