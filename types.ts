export enum Role {
  RESIDENT = 'RESIDENT',
  OFFICIAL = 'OFFICIAL'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
  SPAM = 'SPAM',
  ON_HOLD = 'ON_HOLD'
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AIAnalysis {
  priorityScore: number; // 0-100
  urgencyLevel: UrgencyLevel;
  impactAnalysis: string;
  suggestedAction: string;
  estimatedResourceIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  categoryCorrection?: string;
  confidenceScore?: number; // 0-100
  isTroll?: boolean;
  trollAnalysis?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  submittedBy: string; // Anonymous or Resident Name
  submittedAt: string; // ISO Date
  status: ComplaintStatus;
  aiAnalysis?: AIAnalysis;
  isAnalyzing?: boolean;
  isEscalated?: boolean;
  photos?: string[]; // Array of photo file paths/URLs as evidence
  contactNumber?: string;
}

export interface Stats {
  total: number;
  pending: number;
  resolved: number;
  critical: number;
}
