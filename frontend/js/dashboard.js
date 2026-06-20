// ========================================
// Smart Campus Bus — Dashboard Router
// ========================================

import { initAuthGuard } from "./auth-guard.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow all roles
    const authData = await initAuthGuard(true);
    
    if (authData) {
        const role = authData.profile.role;
        
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
