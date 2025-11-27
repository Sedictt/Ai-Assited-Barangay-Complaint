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
    DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Complaint } from '../types';

const COMPLAINTS_COLLECTION = 'complaints';

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
