// ========================================
// Smart Campus Bus — Dashboard Router
// ========================================

import { initAuthGuard } from "./auth-guard.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow all roles
    const authData = await initAuthGuard(true);
    
    if (authData) {
        const profile = authData.profile;
        const role = profile.role;
        
        const params = new URLSearchParams(window.location.search);
        const intendedRole = params.get("role");

        // Admin override check
        if (intendedRole === 'admin' && (profile.adminLevel === 'main' || profile.adminLevel === 'co')) {
            window.location.replace("admin-dashboard.html");
            return;
        }

        // Redirect to appropriate dashboard
        if (role === 'admin') {
            window.location.replace("admin-dashboard.html");
        } else if (role === 'driver') {
            window.location.replace("driver-dashboard.html");
        } else if (role === 'student') {
            window.location.replace("student-dashboard.html");
        } else {
            console.error("Unknown role:", role);
            alert("Error: Unknown user role.");
        }
    }
});
