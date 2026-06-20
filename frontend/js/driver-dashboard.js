// ========================================
// Smart Campus Bus — Driver Dashboard
// ========================================

import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow only drivers
    const authData = await initAuthGuard(true, ['driver']);
    
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
    const assignedBusEl = document.getElementById("assigned-bus");
    const accountStatusEl = document.getElementById("account-status");
    
    if (nameEl) nameEl.textContent = profile.name || "Driver";
    if (assignedBusEl) assignedBusEl.textContent = profile.assignedBus || "None";
    
    if (accountStatusEl) {
        accountStatusEl.textContent = profile.status.charAt(0).toUpperCase() + profile.status.slice(1);
    }
    
    // Check Email Verification
    const banner = document.getElementById("email-verification-banner");
    const resendBtn = document.getElementById("resend-verification-btn");
    
    if (!user.emailVerified) {
        if (banner) {
            banner.style.display = "flex";
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
