// firebase.js - Minimal Firebase Configuration
// The user must replace these values with their own from the Firebase Console.

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Placeholder config - User needs to fill this!
const firebaseConfig = {
    apiKey: "AIzaSyBwDft82qUWbeMNM4Dq-cOgClaRXi6BndQ",
    authDomain: "url-dashboard-sync.firebaseapp.com",
    projectId: "url-dashboard-sync",
    storageBucket: "url-dashboard-sync.firebasestorage.app",
    messagingSenderId: "1045539948520",
    appId: "1:1045539948520:web:65d24d68d59ce760ad065d",
    measurementId: "G-CLJE9F9YPL"
};

// Initialize only if config is valid to prevent crashes during dev
let db = null;
try {
    if (firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } else {
        console.warn("Firebase not configured. Cloud Sync will not work until keys are added to firebase.js");
    }
} catch (e) {
    console.warn("Firebase initialization failed:", e);
}

// Service methods
export const cloudStorage = {
    // Save encrypted blob
    save: async (syncId, encryptedData) => {
        if (!db) throw new Error("Firebase not configured");
        await setDoc(doc(db, "dashboards", syncId), {
            data: encryptedData,
            updatedAt: new Date().toISOString()
        });
    },

    // Load encrypted blob
    load: async (syncId) => {
        if (!db) throw new Error("Firebase not configured");
        const docRef = doc(db, "dashboards", syncId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().data;
        } else {
            return null; // Not found
        }
    },

    // Subscribe to changes
    subscribe: (syncId, onUpdate) => {
        if (!db) return () => { }; // return no-op if no db
        const docRef = doc(db, "dashboards", syncId);
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // We pass the whole data object including timestamp? Or just encrypted data?
                // load() returns .data. So make this consistent.
                onUpdate(data.data);
            }
        });
    }
};

// Team Sharing Service (Easy Codes)
export const teamStorage = {
    // Generate a random 6-char alphanumeric code
    generateCode: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (I/1, O/0)
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Format: ABC-123
        return result.substring(0, 3) + '-' + result.substring(3);
    },

    saveTeam: async (teamData) => {
        if (!db) throw new Error("Firebase not configured");

        // Try up to 3 times to generate a unique code
        for (let i = 0; i < 3; i++) {
            const code = teamStorage.generateCode();
            const docRef = doc(db, "shared_teams", code);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    data: teamData,
                    createdAt: new Date().toISOString()
                });
                return code;
            }
        }
        throw new Error("Failed to generate a unique code. Please try again.");
    },

    getTeam: async (code) => {
        if (!db) throw new Error("Firebase not configured");

        // Normalize code (uppercase, handle optional dash)
        const cleanCode = code.toUpperCase().trim();
        // If user typed 'ABC123', try to format it or check both. Use exact match first.
        let docRef = doc(db, "shared_teams", cleanCode);
        let docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().data;
        }

        // Handle case where user omitted dash
        if (!cleanCode.includes('-') && cleanCode.length === 6) {
            const formatted = cleanCode.substring(0, 3) + '-' + cleanCode.substring(3);
            docRef = doc(db, "shared_teams", formatted);
            docSnap = await getDoc(docRef);
            if (docSnap.exists()) return docSnap.data().data;
        }

        return null;
    }
};
