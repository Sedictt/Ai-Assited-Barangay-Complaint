// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC_gUOc2RX8ocpumumHg8Cz361TAuf4H30",
    authDomain: "barangay-complaint-ps.firebaseapp.com",
    projectId: "barangay-complaint-ps",
    storageBucket: "barangay-complaint-ps.firebasestorage.app",
    messagingSenderId: "938930340804",
    appId: "1:938930340804:web:37cf76fc7408c1287c9a91",
    measurementId: "G-JK049XJDQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
