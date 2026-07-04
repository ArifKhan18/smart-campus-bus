import { app, auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Keep track of auth state
let currentUser = null;
let currentProfile = null;

// Initialize auth listener
export function initAuthGuard(requireAuth = true, allowedRoles = []) {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                
                try {
                    // Fetch user profile from Firestore
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        currentProfile = docSnap.data();
                        
                        // Check if user is blocked
                        if (currentProfile.status === 'blocked') {
                            if (requireAuth) {
                                alert("Your account has been blocked by the administrator.");
                                await logoutUser();
                                window.location.href = "login.html";
                            }
                            return resolve(null);
                        }

                        // Check role authorization if specified
                        if (allowedRoles.length > 0 && !allowedRoles.includes(currentProfile.role)) {
                            console.warn("Unauthorized role. Redirecting...");
                            window.location.href = "../index.html"; // Redirect to home or generic error page
                            return resolve(null);
                        }
                        
                        // Check driver approval status if applicable
                        if (currentProfile.role === 'driver' && currentProfile.status !== 'active') {
                            // If they are on a protected page but not approved
                            if (requireAuth) {
                                alert("Your driver account is pending admin approval. You cannot access this page yet.");
                                await logoutUser();
                                window.location.href = `login.html?role=driver&status=${currentProfile.status}`;
                                return resolve(null);
                            }
                        }
                        
                        resolve({ user, profile: currentProfile });
                    } else {
                        console.error("No user profile found in Firestore!");
                        if (requireAuth) {
                            await logoutUser();
                            window.location.href = "login.html";
                        }
                        resolve(null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    resolve(null);
                }
            } else {
                currentUser = null;
                currentProfile = null;
                if (requireAuth) {
                    window.location.href = "role-select.html";
                }
                resolve(null);
            }
        });
    });
}

// Global logout function
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = "role-select.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
    }
}

// Helper to get current user info
export function getCurrentUser() {
    return { user: currentUser, profile: currentProfile };
}
