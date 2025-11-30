import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    limit
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Role } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Login user by checking username and password against Firestore
 * NOTE: In a production app, use Firebase Auth. This is a prototype simulation.
 */
export const loginUser = async (username: string, password: string): Promise<User | null> => {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('username', '==', username),
            where('password', '==', password),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const docData = snapshot.docs[0].data();
        return {
            id: snapshot.docs[0].id,
            ...docData
        } as User;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

/**
 * Get all users (for Superadmin)
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const snapshot = await getDocs(collection(db, USERS_COLLECTION));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as User));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

/**
 * Create a new user
 */
export const createUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<string> => {
    try {
        // Check if username exists
        const q = query(collection(db, USERS_COLLECTION), where('username', '==', user.username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            throw new Error('Username already exists');
        }

        const newUser = {
            ...user,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);
        return docRef.id;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Update a user
 */
export const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, id);
        await updateDoc(userRef, updates);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Delete a user
 */
export const deleteUser = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

/**
 * Seed a default Superadmin if none exists
 */
export const seedSuperAdmin = async (): Promise<void> => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where('username', '==', 'admin'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('Seeding default Superadmin...');
            await addDoc(collection(db, USERS_COLLECTION), {
                username: 'admin',
                password: 'admin123',
                fullName: 'System Administrator',
                role: Role.SUPERADMIN,
                createdAt: new Date().toISOString()
            });
        } else {
            // Ensure the default admin always has the correct password (useful for dev/prototyping)
            const adminDoc = snapshot.docs[0];
            if (adminDoc.data().password !== 'admin123') {
                console.log('Updating default Superadmin password...');
                await updateDoc(doc(db, USERS_COLLECTION, adminDoc.id), {
                    password: 'admin123'
                });
            }
        }
    } catch (error) {
        console.error('Error seeding superadmin:', error);
    }
};
