import React from 'react';
import { Role } from '../types';
import { X, CheckCircle, AlertTriangle, FileText, Filter } from './Icons';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose, role }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {role === Role.RESIDENT ? "Resident User Guide" : "Official User Guide"}
            </h2>
            <p className="text-sm text-gray-500">How to use the Maysan AI-Assist System</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {role === Role.RESIDENT ? (
            <>
              {/* Resident Guide */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl h-fit">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">1. Submit a Complaint</h3>
                    <p className="text-gray-600 mt-1">
                      Fill out the form on the left. Be specific about the <strong>Location</strong> (e.g., "Near the chapel") and the <strong>Description</strong> so the AI can understand the urgency.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl h-fit">
                    <div className="w-6 h-6 text-purple-600 font-bold flex items-center justify-center">AI</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">2. Automated Analysis</h3>
                    <p className="text-gray-600 mt-1">
                      Our system reads your complaint immediately. It assigns a <strong>Priority Level</strong> (Low, Medium, High) to help officials see the most critical issues first.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-green-100 p-3 rounded-xl h-fit">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">3. Track Progress</h3>
                    <p className="text-gray-600 mt-1">
                      Look at the "My Submitted Complaints" list. You can see the status change from <strong>Pending</strong> to <strong>Resolved</strong> as officials work on it.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Official Guide */}
              <div className="space-y-6">
                 <div className="flex gap-4">
                  <div className="bg-red-100 p-3 rounded-xl h-fit">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Understanding Priority Scores</h3>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                      The AI scores every complaint from 0 to 100.
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="font-medium">Red (High/Critical):</span> Immediate attention required (Score 80-100).
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                        <span className="font-medium">Orange (Medium):</span> Schedule for action soon (Score 50-79).
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="font-medium">Green (Low):</span> Minor issues to address when free (Score 0-49).
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-gray-100 p-3 rounded-xl h-fit">
                    <Filter className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Filtering & Sorting</h3>
                    <p className="text-gray-600 mt-1">
                      Use the toolbar above the list to find specific issues. You can filter by <strong>Category</strong> (like Floods or Noise) or sort by <strong>Date</strong> to see the newest reports first.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-blue-800 text-sm font-medium">
                    <strong>Tip:</strong> Always check the "AI Analysis" section in the complaint details. It suggests immediate actions and estimates the manpower needed.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuide;