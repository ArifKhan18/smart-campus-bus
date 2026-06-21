// ========================================
// Smart Campus Bus — Student Dashboard
// ========================================

import { db } from "./firebase-config.js";
import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow only students
    const authData = await initAuthGuard(true, ['student']);
    
    if (authData) {
        setupDashboard(authData.user, authData.profile);
        initNavigation();
        initDataListeners();
        
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

// ── Navigation Logic ──
function initNavigation() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navBuses = document.getElementById('nav-buses');
    const navRoutes = document.getElementById('nav-routes');
    const navSchedules = document.getElementById('nav-schedules');
    
    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionBuses = document.getElementById('section-buses');
    const sectionRoutes = document.getElementById('section-routes');
    const sectionSchedules = document.getElementById('section-schedules');
    
    const pageTitle = document.getElementById('page-title');

    function resetTabs() {
        if(navDashboard) navDashboard.classList.remove('active');
        if(navBuses) navBuses.classList.remove('active');
        if(navRoutes) navRoutes.classList.remove('active');
        if(navSchedules) navSchedules.classList.remove('active');
        
        if(sectionDashboard) sectionDashboard.style.display = 'none';
        if(sectionBuses) sectionBuses.style.display = 'none';
        if(sectionRoutes) sectionRoutes.style.display = 'none';
        if(sectionSchedules) sectionSchedules.style.display = 'none';
    }

    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navDashboard.classList.add('active');
            sectionDashboard.style.display = 'block';
            pageTitle.textContent = "Student Portal";
        });
    }

    if (navBuses) {
        navBuses.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navBuses.classList.add('active');
            sectionBuses.style.display = 'block';
            pageTitle.textContent = "Available Buses";
        });
    }

    if (navRoutes) {
        navRoutes.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navRoutes.classList.add('active');
            sectionRoutes.style.display = 'block';
            pageTitle.textContent = "Routes & Stops";
        });
    }

    if (navSchedules) {
        navSchedules.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navSchedules.classList.add('active');
            sectionSchedules.style.display = 'block';
            pageTitle.textContent = "Schedules";
        });
    }
}

// ── Data Listeners ──
let allBuses = [];
let allRoutes = [];
let allSchedules = [];
let currentMap = null;
let currentBusMarker = null;
let currentSelectedBusId = null;

function initDataListeners() {
    listenToBuses();
    listenToRoutes();
    listenToSchedules();
}

function listenToBuses() {
    const q = query(collection(db, "buses"));
    onSnapshot(q, (snapshot) => {
        allBuses = [];
        snapshot.forEach((doc) => {
            allBuses.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort: Running first, then Active, then alphabetical
        allBuses.sort((a, b) => {
            if (a.status === 'running' && b.status !== 'running') return -1;
            if (a.status !== 'running' && b.status === 'running') return 1;
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return a.busName.localeCompare(b.busName);
        });
        
        renderBuses();
    }, (error) => {
        console.error("Error fetching buses:", error);
    });
}

function listenToRoutes() {
    const q = query(collection(db, "routes"));
    onSnapshot(q, (snapshot) => {
        allRoutes = [];
        snapshot.forEach((doc) => {
            allRoutes.push({ id: doc.id, ...doc.data() });
        });
        renderRoutes();
    }, (error) => {
        console.error("Error fetching routes:", error);
    });
}

function listenToSchedules() {
    const q = query(collection(db, "schedules"));
    onSnapshot(q, (snapshot) => {
        allSchedules = [];
        snapshot.forEach((doc) => {
            allSchedules.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by time
        allSchedules.sort((a, b) => {
            return a.departureTime.localeCompare(b.departureTime);
        });
        
        renderSchedules();
    }, (error) => {
        console.error("Error fetching schedules:", error);
    });
}

// ── Render Helpers ──
function getStatusBadge(status) {
    if (status === 'running') return '<span class="status-badge status-badge--running">🟢 Running</span>';
    if (status === 'active') return '<span class="status-badge status-badge--active">Active</span>';
    if (status === 'inactive') return '<span class="status-badge">Inactive</span>';
    if (status === 'maintenance') return '<span class="status-badge status-badge--maintenance">Maintenance</span>';
    if (status === 'special_trip') return '<span class="status-badge status-badge--special">Special Trip</span>';
    return `<span class="status-badge">${status || 'Unknown'}</span>`;
}

function formatTime12Hour(time24) {
    if (!time24) return "";
    let [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    let formattedHour = h < 10 ? '0' + h : h;
    return `${formattedHour}:${minutes} ${ampm}`;
}

// ── Render Functions ──
function renderBuses() {
    const grid = document.getElementById('bus-grid');
    if (!grid) return;

    if (allBuses.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🚐</div>
                <p>No buses currently available.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    allBuses.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        
        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h3 class="driver-card__name" style="margin: 0; font-size: 1.2rem;">${bus.busName}</h3>
                    ${getStatusBadge(bus.status)}
                </div>
                <span class="driver-card__id" style="font-size: 0.85rem; color: var(--text-muted);">${bus.busNumber}</span>
            </div>
            
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                <div class="detail-item" style="margin-bottom: 0.5rem; text-align: left;">
                    <span class="detail-item__label">🗺️ Current Route</span>
                    <span class="detail-item__value" style="font-weight: 500;">${bus.route || 'Unassigned'}</span>
                </div>
            </div>
            <div style="margin-top: 0.5rem; text-align: center; color: var(--accent-primary); font-size: 0.85rem; font-weight: 600;">
                Click to view details & live map →
            </div>
        `;
        
        card.addEventListener('click', () => openBusDetails(bus.id));
        
        grid.appendChild(card);
    });
}

// ── Bus Details & Map Logic ──
function openBusDetails(busId) {
    currentSelectedBusId = busId;
    const bus = allBuses.find(b => b.id === busId);
    if (!bus) return;
    
    // Hide buses list, show details
    document.getElementById('section-buses').style.display = 'none';
    const sectionDetails = document.getElementById('section-bus-details');
    sectionDetails.style.display = 'block';
    
    // Setup Header
    document.getElementById('detail-bus-name').textContent = bus.busName;
    document.getElementById('detail-bus-status').innerHTML = getStatusBadge(bus.status);
    
    // Setup Back Button
    document.getElementById('btn-back-buses').onclick = () => {
        sectionDetails.style.display = 'none';
        document.getElementById('section-buses').style.display = 'block';
        currentSelectedBusId = null;
    };
    
    // Map Logic
    const overlay = document.getElementById('map-overlay');
    
    // Initialize map once
    if (!currentMap) {
        currentMap = L.map('bus-map').setView([23.8122, 90.3582], 15); // BUBT Coordinates
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(currentMap);
        
        const busIcon = L.divIcon({
            html: '<div style="font-size: 24px; background: rgba(0,212,170,0.2); border-radius: 50%; border: 2px solid #00ffcc; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,212,170,0.5);">🚌</div>',
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        currentBusMarker = L.marker([23.8122, 90.3582], {icon: busIcon}).addTo(currentMap);
    }
    
    // Important: Invalidate size after unhiding to prevent rendering bugs
    setTimeout(() => {
        currentMap.invalidateSize();
    }, 100);
    
    if (bus.status === 'running') {
        overlay.style.display = 'none';
        // In the future (Phase 14+), we will update the marker with real coordinates from bus/trip
        // For Phase 11, it's a dummy location at BUBT
    } else {
        overlay.style.display = 'flex';
    }
    
    // Render specific schedules for this bus
    renderBusSpecificSchedules(busId);
}

function renderBusSpecificSchedules(busId) {
    const grid = document.getElementById('detail-schedule-grid');
    if (!grid) return;
    
    const busSchedules = allSchedules.filter(s => s.busId === busId);
    
    if (busSchedules.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No schedules assigned to this bus yet.</p></div>';
        return;
    }
    
    grid.innerHTML = '';
    busSchedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let daysText = "All Days";
        if (schedule.operatingDays && schedule.operatingDays.length > 0) {
            daysText = schedule.operatingDays.length === 7 ? "Everyday" : schedule.operatingDays.map(d => d.substring(0,3)).join(', ');
        }
        
        const formattedTime = formatTime12Hour(schedule.departureTime);
        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <h3 class="driver-card__name" style="margin: 0; font-size: 1.5rem; color: var(--text-light);">
                    🕒 ${formattedTime}
                </h3>
            </div>
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                <div class="detail-item" style="text-align: left;">
                    <span class="detail-item__label">📅 Operating Days</span>
                    <span class="detail-item__value" style="color: var(--accent-success);">${daysText}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderRoutes() {
    const grid = document.getElementById('route-grid');
    if (!grid) return;

    if (allRoutes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🗺️</div>
                <p>No routes available.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    allRoutes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        const busObj = allBuses.find(b => b.id === route.assignedBus);
        const busName = busObj ? `[${busObj.busName}]` : (route.assignedBusName ? `[${route.assignedBusName}]` : '[Unassigned]');
        
        let stopsHtml = '';
        if (route.stops && route.stops.length > 0) {
            stopsHtml = '<div class="route-stops-list" style="display: flex; flex-direction: column; gap: 0.3rem; margin: 1rem 0; padding-left: 1rem; border-left: 2px solid var(--border-card);">';
            route.stops.forEach((stop, index) => {
                let dotColor = 'var(--text-muted)';
                if (index === 0) dotColor = 'var(--accent-success)';
                if (index === route.stops.length - 1) dotColor = 'var(--accent-warning)';
                
                stopsHtml += `
                    <div style="position: relative; padding-left: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                        <div style="position: absolute; left: -1.4rem; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; border: 2px solid var(--bg-surface);"></div>
                        ${stop.name}
                    </div>
                `;
            });
            stopsHtml += '</div>';
        }

        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h3 class="driver-card__name" style="margin: 0; font-size: 1.1rem;">${route.routeName}</h3>
                    <span class="status-badge ${route.assignedBus ? 'status-badge--active' : 'status-badge'}">${busName}</span>
                </div>
            </div>
            
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                ${stopsHtml}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function renderSchedules() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;

    if (allSchedules.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📅</div>
                <p>No schedules available.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    allSchedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let daysText = "All Days";
        if (schedule.operatingDays && schedule.operatingDays.length > 0) {
            if (schedule.operatingDays.length === 7) {
                daysText = "Everyday";
            } else {
                daysText = schedule.operatingDays.map(d => d.substring(0,3)).join(', ');
            }
        }
        
        const busObj = allBuses.find(b => b.id === schedule.busId);
        const busName = busObj ? busObj.busName : (schedule.busName || 'Unknown Bus');
        const formattedTime = formatTime12Hour(schedule.departureTime);

        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h3 class="driver-card__name" style="margin: 0; font-size: 1.5rem; color: var(--text-light);">
                        🕒 ${formattedTime}
                    </h3>
                </div>
            </div>
            
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                <div class="detail-item" style="margin-bottom: 0.5rem; text-align: left;">
                    <span class="detail-item__label">🚐 Assigned Bus</span>
                    <span class="detail-item__value" style="font-weight: 500;">${busName}</span>
                </div>
                <div class="detail-item" style="text-align: left;">
                    <span class="detail-item__label">📅 Operating Days</span>
                    <span class="detail-item__value" style="color: var(--accent-success);">${daysText}</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}
