// ========================================
// Smart Campus Bus — Auth Pages (Login / Register)
// ========================================
// Handles role-based UI theming, form validation (UI only),
// password toggle, and navigation between login/register.

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

    // Show bus dropdown for drivers on register page
    const busGroup = document.getElementById("form-group-bus");
    if (busGroup && role === "driver") {
        busGroup.style.display = "block";
    }
}

// ── Password Toggle ──
function initPasswordToggle() {
    const toggles = document.querySelectorAll(".form-group__toggle-password");

    toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const wrapper = toggle.closest(".form-group__input-wrapper");
            const input = wrapper.querySelector(".form-group__input");

            if (input.type === "password") {
                input.type = "text";
                toggle.textContent = "🙈";
            } else {
                input.type = "password";
                toggle.textContent = "👁️";
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
function handleLoginSubmit(role) {
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
        // Phase 1: Just show a message — actual auth in Phase 2
        const submitBtn = document.getElementById("auth-submit");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Signing In...";
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert(
                `✅ Login UI works!\n\nRole: ${role}\nEmail: ${email.value}\n\n🔧 Firebase Authentication will be connected in Phase 2.`
            );
        }, 1500);
    }
}

// ── Register Form Submit Handler ──
function handleRegisterSubmit(role) {
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

    // Validate bus selection for drivers
    if (role === "driver") {
        const bus = document.getElementById("register-bus");
        if (!bus.value) {
            isValid = false;
        }
    }

    if (isValid) {
        // Phase 1: Just show a message — actual auth in Phase 2
        const submitBtn = document.getElementById("auth-submit");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Creating Account...";
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert(
                `✅ Registration UI works!\n\nRole: ${role}\nName: ${name.value}\nEmail: ${email.value}\n\n🔧 Firebase Authentication will be connected in Phase 2.`
            );
        }, 1500);
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
