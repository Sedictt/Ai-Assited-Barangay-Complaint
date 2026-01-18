export enum Role {
  RESIDENT = 'RESIDENT',
  OFFICIAL = 'OFFICIAL',
  SUPERADMIN = 'SUPERADMIN'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only used for creation/auth, usually not returned in list
  fullName: string;
  role: Role;
  createdAt: string;
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

export interface InternalNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  author: string;
  timestamp: string;
  details: string;
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
  email?: string;
  internalNotes?: InternalNote[];
  auditLog?: AuditLogEntry[];
}

export interface Stats {
  total: number;
  pending: number;
  resolved: number;
  critical: number;
}

export enum LogCategory {
  AUTH = 'AUTH',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  COMPLAINT = 'COMPLAINT',
  SYSTEM = 'SYSTEM'
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  category: LogCategory;
  actor: string;
  details: string;
  metadata?: {
    userId?: string;
    complaintId?: string;
    target?: string;
  };
}
export interface EvacuationCenter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'FULL';
  needs?: string; // e.g., "Blankets, Water"
}

export interface SafetyCheckIn {
  id: string;
  userId: string;
  userName: string;
  status: 'SAFE' | 'NEED_RESCUE';
  location: string;
  timestamp: string;
  message?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  contractor: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'DELAYED';
  progress: number; // 0-100
  photos?: string[];
}

export interface Ordinance {
  id: string;
  title: string;
  category: string;
  summary: string;
  fullText?: string;
  dateEnacted: string;
}

export interface Job {
  id: string;
  title: string;
  employer: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
  salary: string;
  description: string;
  contactInfo: string;
  postedAt: string;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  price: string;
  description: string;
  category: string;
  images?: string[];
  contactInfo: string;
  postedAt: string;
}
