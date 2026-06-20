import { initAuthGuard, logoutUser, getCurrentUser } from "./auth-guard.js";
import { auth } from "./firebase-config.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow all roles
    const authData = await initAuthGuard(true);
    
    if (authData) {
        if (authData.profile.role === 'admin') {
            window.location.replace("admin-dashboard.html");
            return;
        }

        populateDashboard(authData.user, authData.profile);
        setupLogout();
        setupEmailVerification(authData.user);
    }
});

function populateDashboard(user, profile) {
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    const roleBadgeEl = document.getElementById("user-role-badge");
    const roleTextEl = document.getElementById("user-role-text");
    
    if (nameEl) nameEl.textContent = profile.name || "User";
    if (emailEl) {
        emailEl.textContent = user.email;
        if (user.emailVerified) {
            emailEl.innerHTML += ' <span title="Verified" style="color: #00d4aa;">✓</span>';
        } else {
            emailEl.innerHTML += ' <span title="Not Verified" style="color: var(--accent-warm);">⚠</span>';
        }
    }
    
    if (roleBadgeEl && roleTextEl) {
        roleTextEl.textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
        
        // Remove existing classes
        roleBadgeEl.className = "auth__role-badge";
        
        // Add specific role class
        if (profile.role === 'student') {
            roleBadgeEl.classList.add('auth__role-badge--student');
            roleBadgeEl.querySelector('.auth__role-badge-icon').textContent = '🎓';
        } else if (profile.role === 'driver') {
            roleBadgeEl.classList.add('auth__role-badge--driver');
            roleBadgeEl.querySelector('.auth__role-badge-icon').textContent = '🚐';
        } else if (profile.role === 'admin') {
            roleBadgeEl.classList.add('auth__role-badge--admin');
            roleBadgeEl.querySelector('.auth__role-badge-icon').textContent = '🛡️';
        }
    }
}

function setupEmailVerification(user) {
    const banner = document.getElementById("email-verification-banner");
    const resendBtn = document.getElementById("resend-verification-btn");
    
    if (!user.emailVerified) {
        if (banner) banner.style.display = "block";
        
        if (resendBtn) {
            resendBtn.addEventListener("click", async () => {
                const originalText = resendBtn.textContent;
                resendBtn.textContent = "Sending...";
                resendBtn.disabled = true;
                
                try {
                    await sendEmailVerification(user);
                    resendBtn.textContent = "Sent! Check your inbox.";
                    setTimeout(() => {
                        resendBtn.textContent = originalText;
                        resendBtn.disabled = false;
                    }, 5000);
                } catch (error) {
                    console.error("Error sending verification email:", error);
                    resendBtn.textContent = "Failed. Try again.";
                    resendBtn.disabled = false;
                    
                    if (error.code === 'auth/too-many-requests') {
                        alert("We've sent too many requests. Please wait a bit before trying again.");
                    } else {
                        alert(error.message);
                    }
                }
            });
        }
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logoutUser();
        });
    }
}
