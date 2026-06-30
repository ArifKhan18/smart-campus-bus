// ========================================
// Smart Campus Bus — Admin Dashboard
// ========================================

import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// State
let allDrivers = [];
let currentFilter = 'all';
let unsubscribeDrivers = null;

// DOM Elements
const driverGrid = document.getElementById('driver-grid');
const filterTabs = document.querySelectorAll('.filter-tab');
const adminName = document.getElementById('admin-name');
const btnLogout = document.getElementById('btn-logout');

// ── Initialization ──
document.addEventListener("DOMContentLoaded", () => {
    // Auth state is checked by auth-guard.js, but we need the user profile here
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Set Admin Name from guard or fetch it
            // Assuming auth-guard already verified this is an admin
            setupDashboard();
        }
    });

    // Logout Setup
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html?role=admin";
            } catch (error) {
                console.error("Logout Error:", error);
            }
        });
    }

    // Filter Tabs Setup
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active class
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update filter and render
            currentFilter = tab.dataset.filter;
            renderDrivers();
        });
    });

    // Section Toggle Logic
    const navDrivers = document.getElementById('nav-drivers');
    const navBuses = document.getElementById('nav-buses');
    const navRoutes = document.getElementById('nav-routes');
    const navSchedules = document.getElementById('nav-schedules');
    const navAnnouncements = document.getElementById('nav-announcements');
    const navAnalytics = document.getElementById('nav-analytics');

    const sectionDrivers = document.getElementById('section-drivers');
    const sectionBuses = document.getElementById('section-buses');
    const sectionRoutes = document.getElementById('section-routes');
    const sectionSchedules = document.getElementById('section-schedules');
    const sectionAnnouncements = document.getElementById('section-announcements');
    const sectionAnalytics = document.getElementById('section-analytics');

    function resetTabs() {
        if (navDrivers) navDrivers.classList.remove('active');
        if (navBuses) navBuses.classList.remove('active');
        if (navRoutes) navRoutes.classList.remove('active');
        if (navSchedules) navSchedules.classList.remove('active');
        if (navAnnouncements) navAnnouncements.classList.remove('active');
        if (navAnalytics) navAnalytics.classList.remove('active');

        if (sectionDrivers) sectionDrivers.style.display = 'none';
        if (sectionBuses) sectionBuses.style.display = 'none';
        if (sectionRoutes) sectionRoutes.style.display = 'none';
        if (sectionSchedules) sectionSchedules.style.display = 'none';
        if (sectionAnnouncements) sectionAnnouncements.style.display = 'none';
        if (sectionAnalytics) sectionAnalytics.style.display = 'none';
    }

    if (navDrivers) {
        navDrivers.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navDrivers.classList.add('active');
            sectionDrivers.style.display = 'block';
        });
    }

    if (navBuses) {
        navBuses.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navBuses.classList.add('active');
            sectionBuses.style.display = 'block';
        });
    }

    if (navRoutes) {
        navRoutes.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navRoutes.classList.add('active');
            sectionRoutes.style.display = 'block';
        });
    }

    if (navSchedules) {
        navSchedules.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navSchedules.classList.add('active');
            sectionSchedules.style.display = 'block';
        });
    }

    if (navAnnouncements) {
        navAnnouncements.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navAnnouncements.classList.add('active');
            sectionAnnouncements.style.display = 'block';
        });
    }

    if (navAnalytics) {
        navAnalytics.addEventListener('click', (e) => {
            e.preventDefault();
            resetTabs();
            navAnalytics.classList.add('active');
            sectionAnalytics.style.display = 'block';
        });
    }
});

// ── Dashboard Setup ──
function setupDashboard() {
    // Real-time listener for drivers
    const q = query(
        collection(db, "users"),
        where("role", "==", "driver")
        // Note: orderBy requires a composite index if combined with where. 
        // For simplicity in Phase 3, we fetch and sort in memory if needed.
    );

    unsubscribeDrivers = onSnapshot(q, (snapshot) => {
        allDrivers = [];
        snapshot.forEach((doc) => {
            allDrivers.push({ id: doc.id, ...doc.data() });
        });

        // Sort by created date descending (newest first)
        allDrivers.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        updateStats();
        renderDrivers();
    }, (error) => {
        console.error("Error fetching drivers:", error);
        driverGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">⚠️</div>
                <p>Failed to load drivers. Check your connection or permissions.</p>
                <p style="font-size: 0.8rem; color: #ff4d4d; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    });
}

// ── Update Statistics ──
function updateStats() {
    const total = allDrivers.length;
    const pending = allDrivers.filter(d => d.status === 'pending').length;
    const approved = allDrivers.filter(d => d.status === 'active').length;
    const rejected = allDrivers.filter(d => d.status === 'rejected').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-rejected').textContent = rejected;
}

// ── Render Drivers ──
function renderDrivers() {
    if (!driverGrid) return;

    const filteredDrivers = currentFilter === 'all'
        ? allDrivers
        : allDrivers.filter(d => d.status === currentFilter);

    if (filteredDrivers.length === 0) {
        let message = currentFilter === 'all' ? "No drivers found in the system." : `No ${currentFilter} drivers found.`;
        driverGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🚐</div>
                <p>${message}</p>
            </div>
        `;
        return;
    }

    driverGrid.innerHTML = '';

    filteredDrivers.forEach(driver => {
        const card = document.createElement('div');
        card.className = 'driver-card';

        const dateStr = driver.createdAt ? driver.createdAt.toDate().toLocaleDateString() : 'Unknown';

        let statusBadgeClass = '';
        let statusText = '';
        if (driver.status === 'pending') { statusBadgeClass = 'status-badge--pending'; statusText = 'Pending'; }
        else if (driver.status === 'active') { statusBadgeClass = 'status-badge--active'; statusText = 'Approved'; }
        else if (driver.status === 'rejected') { statusBadgeClass = 'status-badge--rejected'; statusText = 'Rejected'; }

        // Generate Action Buttons based on status
        let actionsHtml = '';
        if (driver.status === 'pending') {
            actionsHtml = `
                <div class="driver-card__actions">
                    <button class="btn-action btn-approve" onclick="updateDriverStatus('${driver.id}', 'active')">
                        <span>✅</span> Approve
                    </button>
                    <button class="btn-action btn-reject" onclick="updateDriverStatus('${driver.id}', 'rejected')">
                        <span>❌</span> Reject
                    </button>
                </div>
            `;
        } else if (driver.status === 'rejected') {
            actionsHtml = `
                <div class="driver-card__actions">
                    <button class="btn-action btn-approve" onclick="updateDriverStatus('${driver.id}', 'active')">
                        <span>✅</span> Approve Instead
                    </button>
                </div>
            `;
        } else if (driver.status === 'active') {
            actionsHtml = `
                <div class="driver-card__actions">
                    <button class="btn-action btn-reject" style="opacity: 0.7;" onclick="if(confirm('Are you sure you want to revoke this driver\\'s access?')) updateDriverStatus('${driver.id}', 'rejected')">
                        <span>🚫</span> Revoke Access
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="driver-card__header">
                <div class="driver-card__info">
                    <span class="driver-card__name">${driver.name || 'Unknown Name'}</span>
                    <span class="driver-card__email">${driver.email}</span>
                </div>
                <span class="status-badge ${statusBadgeClass}">${statusText}</span>
            </div>
            
            <div class="driver-card__details">
                <div class="detail-item">
                    <span class="detail-item__label">Assigned Bus</span>
                    <span class="detail-item__value">${driver.assignedBus || 'Not Assigned'}</span>
                </div>
                <div class="detail-item" style="text-align: right;">
                    <span class="detail-item__label">Applied On</span>
                    <span class="detail-item__value">${dateStr}</span>
                </div>
            </div>
            
            ${actionsHtml}
        `;

        driverGrid.appendChild(card);
    });
}

// ── Make Action Function Global ──
window.updateDriverStatus = async function (driverId, newStatus) {
    try {
        // Option A: Use .NET Backend API (More secure)
        // const response = await fetch(`http://localhost:5000/api/auth/user/${driverId}/status`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: newStatus })
        // });
        // if(!response.ok) throw new Error('Backend update failed');

        // Option B: Direct Firestore SDK (Used here for Phase 3 simplicity)
        const driverRef = doc(db, "users", driverId);
        await updateDoc(driverRef, {
            status: newStatus
        });

        const statusMsg = newStatus === 'active' ? 'Approved' : 'Rejected';
        if (window.showToast) window.showToast(`Driver successfully ${statusMsg.toLowerCase()}!`, 'success');

        // Note: Real-time listener will automatically re-render the UI

    } catch (error) {
        console.error("Error updating status:", error);
        if (window.showToast) window.showToast(`Failed to update status: ${error.message}`, 'error');
        else alert("Failed to update status.");
    }
};
