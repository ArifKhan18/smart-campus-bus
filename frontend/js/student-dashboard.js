// ========================================
// Smart Campus Bus — Student Dashboard
// ========================================

import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow only students
    const authData = await initAuthGuard(true, ['student']);
    
    if (authData) {
        setupDashboard(authData.user, authData.profile);
        
        // Setup Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener("click", () => logoutUser());
        }
    }
});

function setupDashboard(user, profile) {
    // Populate user info
    const nameEl = document.getElementById("user-name");
    const welcomeEl = document.getElementById("welcome-message");
    
    if (nameEl) nameEl.textContent = profile.name || "Student";
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${profile.name || "Student"}!`;
    
    // Check Email Verification
    const banner = document.getElementById("email-verification-banner");
    const resendBtn = document.getElementById("resend-verification-btn");
    
    if (!user.emailVerified) {
        if (banner) {
            banner.style.display = "flex"; // It's hidden by default inline
        }
        
        if (resendBtn) {
            resendBtn.addEventListener("click", async () => {
                const originalText = resendBtn.textContent;
                resendBtn.textContent = "Sending...";
                resendBtn.disabled = true;
                
                try {
                    await sendEmailVerification(user);
                    resendBtn.textContent = "Sent! Check inbox.";
                    setTimeout(() => {
                        resendBtn.textContent = originalText;
                        resendBtn.disabled = false;
                    }, 5000);
                } catch (error) {
                    console.error("Error sending verification email:", error);
                    resendBtn.textContent = "Failed. Try again.";
                    resendBtn.disabled = false;
                    alert(error.message);
                }
            });
        }
    }
}
