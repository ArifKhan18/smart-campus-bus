// ========================================
// Firebase Web SDK Configuration
// ========================================
// Firebase v10+ (Modular SDK) — CDN Imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Detect environment ──
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// ── Firebase Configuration ──
// On deployed environments (Vercel/Render), use the current hostname as authDomain
// to avoid third-party cookie blocking issues with Google Sign-In popup/redirect flows.
// Firebase Auth uses authDomain for the OAuth handler page (__/auth/handler).
// When authDomain differs from the page's origin, browsers block cookies as third-party,
// causing the sign-in to silently fail after account selection.
const firebaseConfig = {
    apiKey: "AIzaSyDJmFroVCpTFAxD0n035fd1vCfIrZceyqk",
    authDomain: isLocalhost ? "smart-campus-bus-2bc13.firebaseapp.com" : window.location.hostname,
    projectId: "smart-campus-bus-2bc13",
    storageBucket: "smart-campus-bus-2bc13.firebasestorage.app",
    messagingSenderId: "445243680063",
    appId: "1:445243680063:web:46cebd5f54d97ef9cb1f8a"
};

// ── Initialize Firebase ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log(`✅ Firebase initialized (authDomain: ${firebaseConfig.authDomain})`);

// ── Export for use in other modules ──
export { app, auth, db };

