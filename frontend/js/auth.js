// ========================================
// Smart Campus Bus — Auth Pages (Login / Register)
// ========================================
// Handles role-based UI theming, form validation,
// password toggle, and real Firebase Authentication.

import { auth, db } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Role Configuration ──
const ROLE_CONFIG = {
    student: {
        icon: "🎓",
        label: "Student",
        cardClass: "auth__card--student",
        badgeClass: "auth__role-badge--student",
        submitClass: "auth__submit--student",
        inputClass: "form-group__input--student",
        hasRegister: true,
    },
    driver: {
        icon: "🚐",
        label: "Driver",
        cardClass: "auth__card--driver",
        badgeClass: "auth__role-badge--driver",
        submitClass: "auth__submit--driver",
        inputClass: "form-group__input--driver",
        hasRegister: true,
    },
    admin: {
        icon: "🛡️",
        label: "Admin",
        cardClass: "auth__card--admin",
        badgeClass: "auth__role-badge--admin",
        submitClass: "auth__submit--admin",
        inputClass: "form-group__input--admin",
        hasRegister: false, // Admin cannot register
    },
};

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
    const role = getRoleFromURL();
    console.log(`🚌 Auth Page Loaded — Role: ${role}`);

    applyRoleTheme(role);
    initPasswordToggle();
    initFormValidation(role);
    handleAdminRestrictions(role);
    updateNavigationLinks(role);
    initForgotPassword();
});

// ── Get Role from URL ──
function getRoleFromURL() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    // Default to student if no valid role
    if (!role || !ROLE_CONFIG[role]) {
        return "student";
    }

    return role;
}

// ── Apply Role-Based Theme ──
function applyRoleTheme(role) {
    const config = ROLE_CONFIG[role];
    if (!config) return;

    // Update role badge
    const roleBadge = document.getElementById("auth-role-badge");
    const roleIcon = document.getElementById("auth-role-icon");
    const roleLabel = document.getElementById("auth-role-label");

    if (roleBadge) {
        // Remove existing role classes
        Object.values(ROLE_CONFIG).forEach((c) => {
            roleBadge.classList.remove(c.badgeClass);
        });
        roleBadge.classList.add(config.badgeClass);
    }

    if (roleIcon) roleIcon.textContent = config.icon;
    if (roleLabel) roleLabel.textContent = config.label;

    // Update card accent
    const authCard = document.getElementById("auth-card");
    if (authCard) {
        Object.values(ROLE_CONFIG).forEach((c) => {
            authCard.classList.remove(c.cardClass);
        });
        authCard.classList.add(config.cardClass);
    }

    // Update submit button
    const submitBtn = document.getElementById("auth-submit");
    if (submitBtn) {
        Object.values(ROLE_CONFIG).forEach((c) => {
            submitBtn.classList.remove(c.submitClass);
        });
        submitBtn.classList.add(config.submitClass);
    }

    // Update input focus colors
    const inputs = document.querySelectorAll(".form-group__input");
    inputs.forEach((input) => {
        Object.values(ROLE_CONFIG).forEach((c) => {
            input.classList.remove(c.inputClass);
        });
        input.classList.add(config.inputClass);
    });

    // Update page title
    const isLogin = window.location.pathname.includes("login");
    document.title = `${isLogin ? "Login" : "Register"} as ${config.label} | Smart Campus Bus`;
}

// ── Handle Admin Restrictions ──
function handleAdminRestrictions(role) {
    if (role !== "admin") return;

    // If admin tries to access register page, redirect to login
    const isRegister = window.location.pathname.includes("register");
    if (isRegister) {
        window.location.href = "login.html?role=admin";
        return;
    }

    // Hide register link on login page for admin
    const authFooter = document.getElementById("auth-footer");
    if (authFooter) {
        authFooter.style.display = "none";
    }
}

// ── Update Navigation Links with Role Param ──
function updateNavigationLinks(role) {
    // Update register link on login page
    const registerLink = document.getElementById("auth-register-link");
    if (registerLink) {
        registerLink.href = `register.html?role=${role}`;
    }

    // Update login link on register page
    const loginLink = document.getElementById("auth-login-link");
    if (loginLink) {
        loginLink.href = `login.html?role=${role}`;
    }
}

// ── Password Toggle ──
function initPasswordToggle() {
    const toggles = document.querySelectorAll(".form-group__toggle-password");

    const eyeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    const eyeOffSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

    toggles.forEach((toggle) => {
        toggle.innerHTML = eyeSvg;
        toggle.addEventListener("click", () => {
            const wrapper = toggle.closest(".form-group__input-wrapper");
            const input = wrapper.querySelector(".form-group__input");

            if (input.type === "password") {
                input.type = "text";
                toggle.innerHTML = eyeOffSvg;
            } else {
                input.type = "password";
                toggle.innerHTML = eyeSvg;
            }
        });
    });
}

// ── Form Validation (UI Only — Phase 1) ──
function initFormValidation(role) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleLoginSubmit(role);
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleRegisterSubmit(role);
        });
    }
}

// ── Login Form Submit Handler ──
async function handleLoginSubmit(role) {
    let isValid = true;

    // Validate email
    const email = document.getElementById("login-email");
    const emailGroup = document.getElementById("form-group-email");
    if (!email.value || !isValidEmail(email.value)) {
        emailGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        emailGroup.classList.remove("form-group--error");
    }

    // Validate password
    const password = document.getElementById("login-password");
    const passwordGroup = document.getElementById("form-group-password");
    if (!password.value) {
        passwordGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        passwordGroup.classList.remove("form-group--error");
    }

    if (isValid) {
        const submitBtn = document.getElementById("auth-submit");
        const loadingOverlay = document.getElementById("auth-loading");
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = "Signing In...";
        submitBtn.disabled = true;
        if(loadingOverlay) loadingOverlay.style.display = "flex";

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
            const user = userCredential.user;

            // 2. Fetch User Profile from Firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data();

                // 3. Verify Role Mismatch
                if (profile.role !== role) {
                    // Sign out because they tried to log in with wrong role
                    await auth.signOut();
                    if(window.showToast) window.showToast(`Error: This account is registered as a ${profile.role}. Please switch roles.`, 'error');
                    else alert(`Error: This account is registered as a ${profile.role}. Please switch roles.`);
                } 
                // 3.5 Verify Email (Skip for admins to prevent lockout if manually added)
                else if (!user.emailVerified && role !== 'admin') {
                    await auth.signOut();
                    if(window.showToast) window.showToast("Please verify your email address before logging in. Check your inbox.", 'warning', 5000);
                    else alert("Please verify your email address before logging in.");
                }
                // 4. Verify Driver Approval Status
                else if (role === 'driver' && profile.status === 'pending') {
                    await auth.signOut();
                    if(window.showToast) window.showToast("Your account is pending admin approval. You cannot log in yet.", 'warning');
                    else alert("Your account is pending admin approval. You cannot log in yet.");
                }
                else if (role === 'driver' && profile.status === 'rejected') {
                    await auth.signOut();
                    if(window.showToast) window.showToast("Your account application was rejected.", 'error');
                    else alert("Your account application was rejected.");
                }
                // 5. Success - Redirect to Dashboard
                else {
                    if(window.showToast) window.showToast("Login successful! Redirecting...", 'success');
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1000);
                    // Don't reset loading state because we are redirecting
                    return; 
                }
            } else {
                await auth.signOut();
                if(window.showToast) window.showToast("User profile not found in database.", 'error');
                else alert("User profile not found in database.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            
            let errorMessage = "An error occurred during login.";
            if (error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Try again later.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if(window.showToast) window.showToast(errorMessage, 'error');
            else alert(errorMessage);
        }

        // Reset UI if not redirected
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        if(loadingOverlay) loadingOverlay.style.display = "none";
    }
}

// ── Register Form Submit Handler ──
async function handleRegisterSubmit(role) {
    let isValid = true;

    // Validate name
    const name = document.getElementById("register-name");
    const nameGroup = document.getElementById("form-group-name");
    if (!name.value.trim()) {
        nameGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        nameGroup.classList.remove("form-group--error");
    }

    // Validate email
    const email = document.getElementById("register-email");
    const emailGroup = document.getElementById("form-group-email");
    if (!email.value || !isValidEmail(email.value)) {
        emailGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        emailGroup.classList.remove("form-group--error");
    }

    // Validate password
    const password = document.getElementById("register-password");
    const passwordGroup = document.getElementById("form-group-password");
    if (!password.value || password.value.length < 6) {
        passwordGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        passwordGroup.classList.remove("form-group--error");
    }

    // Validate confirm password
    const confirmPassword = document.getElementById("register-confirm-password");
    const confirmGroup = document.getElementById("form-group-confirm-password");
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
        confirmGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        confirmGroup.classList.remove("form-group--error");
    }

    // Bus selection for drivers is handled by admins in Phase 3+
    let selectedBus = null;

    if (isValid) {
        const submitBtn = document.getElementById("auth-submit");
        const loadingOverlay = document.getElementById("auth-loading");
        const loadingText = document.getElementById("auth-loading-text");
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = "Creating Account...";
        submitBtn.disabled = true;
        if(loadingOverlay) {
            if(loadingText) loadingText.textContent = "Creating Account...";
            loadingOverlay.style.display = "flex";
        }

        try {
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
            const user = userCredential.user;

            // 2. Send Verification Email
            try {
                await sendEmailVerification(user);
                console.log("Verification email sent");
            } catch (err) {
                console.error("Error sending verification email", err);
            }

            // 3. Create User Profile in Firestore
            const status = role === "driver" ? "pending" : "active";
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name.value.trim(),
                email: email.value,
                role: role,
                status: status,
                assignedBus: selectedBus,
                createdAt: serverTimestamp()
            });

            // 4. Handle Post-Registration Logic based on Role
            if (role === "driver") {
                // Sign out driver since they are pending approval
                await auth.signOut();
                if(window.showToast) window.showToast("Account created successfully! Waiting for admin approval. Please check your email to verify.", 'success', 6000);
                else alert("Account created successfully! Waiting for admin approval. Please check your email to verify.");
                
                setTimeout(() => {
                    window.location.href = `login.html?role=${role}`;
                }, 2000);
            } else {
                // Student - Keep logged in and redirect? No, sign out so they must verify email
                await auth.signOut();
                if(window.showToast) window.showToast("Account created successfully! Please check your email to verify before logging in.", 'success', 6000);
                else alert("Account created successfully! Please check your email to verify before logging in.");
                
                setTimeout(() => {
                    window.location.href = `login.html?role=${role}`;
                }, 2000);
            }
            // Don't reset UI to prevent duplicate clicks while redirecting
            return;
            
        } catch (error) {
            console.error("Registration Error:", error);
            
            let errorMessage = "An error occurred during registration.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Must be at least 6 characters.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if(window.showToast) window.showToast(errorMessage, 'error');
            else alert(errorMessage);
        }

        // Reset UI if error occurred
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        if(loadingOverlay) loadingOverlay.style.display = "none";
    }
}

// ── Email Validation Helper ──
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ── Clear Error on Input ──
document.addEventListener("input", (e) => {
    if (e.target.classList.contains("form-group__input")) {
        const group = e.target.closest(".form-group");
        if (group) {
            group.classList.remove("form-group--error");
        }
    }
});

// ── Forgot Password Logic ──
function initForgotPassword() {
    const forgotLink = document.getElementById("auth-forgot");
    if (forgotLink) {
        forgotLink.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById("login-email");
            const email = emailInput ? emailInput.value : "";
            
            if (!email || !isValidEmail(email)) {
                if(window.showToast) window.showToast("Please enter a valid email address first.", "warning");
                else alert("Please enter a valid email address first.");
                
                if (emailInput) emailInput.focus();
                return;
            }
            
            try {
                const submitBtn = document.getElementById("auth-submit");
                if (submitBtn) submitBtn.disabled = true;
                
                await sendPasswordResetEmail(auth, email);
                
                if(window.showToast) window.showToast(`Password reset link sent to ${email}`, "success", 5000);
                else alert(`Password reset link sent to ${email}`);
                
            } catch (error) {
                console.error("Forgot Password Error:", error);
                let errorMessage = "Failed to send reset email.";
                if (error.code === 'auth/user-not-found') {
                    errorMessage = "No account found with this email.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                if(window.showToast) window.showToast(errorMessage, "error");
                else alert(errorMessage);
            } finally {
                const submitBtn = document.getElementById("auth-submit");
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}
