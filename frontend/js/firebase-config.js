// ========================================
// Firebase Web SDK Configuration
// ========================================
// Firebase v10+ (Modular SDK) — CDN Imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase Configuration ──
// TODO: Replace these placeholder values with your actual Firebase project config.
// Go to Firebase Console → Project Settings → General → Your apps → Web app
// Copy the firebaseConfig object and paste it here.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ── Initialize Firebase ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase initialized successfully");

// ── Export for use in other modules ──
export { app, auth, db };
