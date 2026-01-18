import {
    collection,
    addDoc,
    setDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    QuerySnapshot,
    DocumentData,
    arrayUnion,
    limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import {
    Complaint,
    InternalNote,
    AuditLogEntry,
    SystemLog,
    EvacuationCenter,
    SafetyCheckIn,
    Project,
    Ordinance,
    Job,
    MarketplaceItem
} from '../types';

const COMPLAINTS_COLLECTION = 'complaints';
const SYSTEM_LOGS_COLLECTION = 'systemLogs';

/**
 * Subscribe to real-time complaints updates
 */
export const subscribeToComplaints = (
    callback: (complaints: Complaint[]) => void
): (() => void) => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const complaints: Complaint[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt,
            } as Complaint;
        });
        callback(complaints);
    });

    return unsubscribe;
};

/**
 * Add a new complaint to Firestore with a specific ID
 */
export const addComplaint = async (complaint: Complaint): Promise<string> => {
    try {
        const complaintData = {
            ...complaint,
            submittedAt: Timestamp.fromDate(new Date(complaint.submittedAt)),
        };

        await setDoc(doc(db, COMPLAINTS_COLLECTION, complaint.id), complaintData);
        return complaint.id;
    } catch (error) {
        console.error('Error adding complaint:', error);
        throw error;
    }
};

/**
 * Update an existing complaint
 */
export const updateComplaint = async (
    id: string,
    updates: Partial<Complaint>
): Promise<void> => {
    try {
        const complaintRef = doc(db, COMPLAINTS_COLLECTION, id);
        await updateDoc(complaintRef, updates);
    } catch (error) {
        console.error('Error updating complaint:', error);
        throw error;
    }
};

/**
 * Add an internal note to a complaint
 */
export const addInternalNote = async (
    complaintId: string,
    note: InternalNote
): Promise<void> => {
    try {
        const complaintRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
        await updateDoc(complaintRef, {
            internalNotes: arrayUnion(note)
        });
    } catch (error) {
        console.error('Error adding internal note:', error);
        throw error;
    }
};

/**
 * Add an audit log entry to a complaint
 */
export const addAuditLogEntry = async (
    complaintId: string,
    entry: AuditLogEntry
): Promise<void> => {
    try {
        const complaintRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
        await updateDoc(complaintRef, {
            auditLog: arrayUnion(entry)
        });
    } catch (error) {
        console.error('Error adding audit log entry:', error);
        throw error;
    }
};

/**
 * Upload photo to Firebase Storage and return the download URL
 */
export const uploadPhoto = async (
    file: File,
    complaintId: string,
    index: number
): Promise<string> => {
    try {
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `complaints/${complaintId}/${timestamp}_${index}_${sanitizedFileName}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

/**
 * Upload multiple photos and return their URLs
 */
export const uploadPhotos = async (
    files: File[],
    complaintId: string
): Promise<string[]> => {
    try {
        const uploadPromises = files.map((file, index) =>
            uploadPhoto(file, complaintId, index)
        );
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading photos:', error);
        throw error;
    }
};

/**
 * Add a system-wide log entry
 */
export const addSystemLog = async (log: Omit<SystemLog, 'id'>): Promise<void> => {
    try {
        await addDoc(collection(db, SYSTEM_LOGS_COLLECTION), log);
    } catch (error) {
        console.error('Error adding system log:', error);
    }
};

/**
 * Subscribe to system logs
 */
export const subscribeToSystemLogs = (
    callback: (logs: SystemLog[]) => void
): (() => void) => {
    const q = query(
        collection(db, SYSTEM_LOGS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(100)
    );

    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SystemLog));
        callback(logs);
    });
};

// New Collections
const EVACUATION_CENTERS_COLLECTION = 'evacuation_centers';
const SAFETY_CHECKINS_COLLECTION = 'safety_checkins';
const PROJECTS_COLLECTION = 'projects';
const ORDINANCES_COLLECTION = 'ordinances';
const JOBS_COLLECTION = 'jobs';
const MARKETPLACE_ITEMS_COLLECTION = 'marketplace_items';

// --- Disaster Resilience ---

export const subscribeToEvacuationCenters = (callback: (centers: EvacuationCenter[]) => void) => {
    const q = query(collection(db, EVACUATION_CENTERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const centers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvacuationCenter));
        callback(centers);
    });
};

export const addEvacuationCenter = async (center: Omit<EvacuationCenter, 'id'>) => {
    await addDoc(collection(db, EVACUATION_CENTERS_COLLECTION), center);
};

export const updateEvacuationCenter = async (id: string, updates: Partial<EvacuationCenter>) => {
    await updateDoc(doc(db, EVACUATION_CENTERS_COLLECTION, id), updates);
};

export const addSafetyCheckIn = async (checkIn: Omit<SafetyCheckIn, 'id'>) => {
    await addDoc(collection(db, SAFETY_CHECKINS_COLLECTION), checkIn);
};

export const subscribeToSafetyCheckIns = (callback: (checkIns: SafetyCheckIn[]) => void) => {
    const q = query(collection(db, SAFETY_CHECKINS_COLLECTION), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const checkIns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SafetyCheckIn));
        callback(checkIns);
    });
};

// --- Transparency ---

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('startDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    });
};

export const addProject = async (project: Omit<Project, 'id'>) => {
    await addDoc(collection(db, PROJECTS_COLLECTION), project);
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
    await updateDoc(doc(db, PROJECTS_COLLECTION, id), updates);
};

export const subscribeToOrdinances = (callback: (ordinances: Ordinance[]) => void) => {
    const q = query(collection(db, ORDINANCES_COLLECTION), orderBy('dateEnacted', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const ordinances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ordinance));
        callback(ordinances);
    });
};

export const addOrdinance = async (ordinance: Omit<Ordinance, 'id'>) => {
    await addDoc(collection(db, ORDINANCES_COLLECTION), ordinance);
};

// --- Local Economy ---

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
    const q = query(collection(db, JOBS_COLLECTION), orderBy('postedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        callback(jobs);
    });
};

export const addJob = async (job: Omit<Job, 'id'>) => {
    await addDoc(collection(db, JOBS_COLLECTION), job);
};

export const subscribeToMarketplaceItems = (callback: (items: MarketplaceItem[]) => void) => {
    const q = query(collection(db, MARKETPLACE_ITEMS_COLLECTION), orderBy('postedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem));
        callback(items);
    });
};

export const addMarketplaceItem = async (item: Omit<MarketplaceItem, 'id'>) => {
    await addDoc(collection(db, MARKETPLACE_ITEMS_COLLECTION), item);
};
