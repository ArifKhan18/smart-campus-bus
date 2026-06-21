// ========================================
// Smart Campus Bus — Driver Dashboard
// ========================================

import { db } from "./firebase-config.js";
import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentDriverUser = null;
let assignedBusId = null;
let activeTripId = null;

// DOM Elements
const btnStart = document.getElementById('btn-start-trip');
const btnStop = document.getElementById('btn-stop-trip');
const statusText = document.getElementById('trip-status');
const assignedBusEl = document.getElementById('assigned-bus');
const scheduleListEl = document.getElementById('duty-schedule-list');

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow only drivers
    const authData = await initAuthGuard(true, ['driver']);
    
    if (authData) {
        currentDriverUser = authData.user;
        setupDashboard(authData.user, authData.profile);
        
        // Setup Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener("click", () => logoutUser());
        }
        
        // Fetch specific driver data
        await fetchDriverData();
        
        // Setup Trip Actions
        if(btnStart) btnStart.addEventListener("click", startTrip);
        if(btnStop) btnStop.addEventListener("click", stopTrip);
    }
});

function setupDashboard(user, profile) {
    const nameEl = document.getElementById("user-name");
    
    if (nameEl) nameEl.textContent = profile.name || "Driver";
    
    // Check Email Verification
    const banner = document.getElementById("email-verification-banner");
    const resendBtn = document.getElementById("resend-verification-btn");
    
    if (!user.emailVerified) {
        if (banner) banner.style.display = "flex";
        
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

async function fetchDriverData() {
    try {
        // 1. Find assigned bus
        const qBuses = query(collection(db, "buses"), where("assignedDriver", "==", currentDriverUser.uid));
        const busSnapshot = await getDocs(qBuses);
        
        if (!busSnapshot.empty) {
            const busDoc = busSnapshot.docs[0];
            const busData = busDoc.data();
            assignedBusId = busDoc.id;
            
            if (assignedBusEl) assignedBusEl.textContent = busData.busName;
            
            // 2. Fetch Schedules for this bus
            fetchSchedules();
            
            // 3. Check for active trips
            checkActiveTrips();
        } else {
            if (assignedBusEl) assignedBusEl.textContent = "No Bus Assigned";
            if (scheduleListEl) scheduleListEl.innerHTML = `
                <div class="schedule-item">
                    <span class="schedule-time" style="color: var(--text-muted);">Please contact admin to assign a bus.</span>
                </div>
            `;
            if(btnStart) {
                btnStart.style.opacity = '0.5';
                btnStart.disabled = true;
                statusText.textContent = 'Cannot start trip: No bus assigned';
            }
        }
    } catch (error) {
        console.error("Error fetching driver data:", error);
    }
}

function fetchSchedules() {
    if (!assignedBusId) return;
    
    const qSchedules = query(collection(db, "schedules"), where("busId", "==", assignedBusId));
    onSnapshot(qSchedules, (snapshot) => {
        const schedules = [];
        snapshot.forEach((doc) => {
            schedules.push(doc.data());
        });
        
        schedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        
        if (scheduleListEl) {
            if (schedules.length === 0) {
                scheduleListEl.innerHTML = `
                    <div class="schedule-item">
                        <span class="schedule-time" style="color: var(--text-muted);">No schedules assigned for today.</span>
                    </div>
                `;
                return;
            }
            
            scheduleListEl.innerHTML = '';
            schedules.forEach(sched => {
                const item = document.createElement('div');
                item.className = 'schedule-item';
                item.innerHTML = `
                    <span class="schedule-time">${formatTime12Hour(sched.departureTime)}</span>
                    <span class="schedule-route">Assigned Duty</span>
                `;
                scheduleListEl.appendChild(item);
            });
        }
    });
}

function checkActiveTrips() {
    // Look for an active trip by this driver
    const qTrips = query(
        collection(db, "trips"), 
        where("driverId", "==", currentDriverUser.uid),
        where("status", "==", "active"),
        limit(1)
    );
    
    onSnapshot(qTrips, (snapshot) => {
        if (!snapshot.empty) {
            // Restore active state
            activeTripId = snapshot.docs[0].id;
            if(btnStart) btnStart.style.display = 'none';
            if(btnStop) btnStop.style.display = 'flex';
            if(statusText) {
                statusText.textContent = '📍 TRIP IN PROGRESS...';
                statusText.style.color = 'var(--accent-success)';
                statusText.style.borderColor = 'rgba(0, 200, 83, 0.2)';
                statusText.style.background = 'rgba(0, 200, 83, 0.05)';
            }
        } else {
            // Reset to default state
            activeTripId = null;
            if(btnStart) btnStart.style.display = 'flex';
            if(btnStop) btnStop.style.display = 'none';
            if(statusText) {
                statusText.textContent = 'Ready for next trip';
                statusText.style.color = 'var(--text-muted)';
                statusText.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                statusText.style.background = 'rgba(255, 255, 255, 0.03)';
            }
        }
    });
}

async function startTrip() {
    if (!assignedBusId || !currentDriverUser) return;
    
    // Disable button to prevent double-clicks
    btnStart.disabled = true;
    
    try {
        // 1. Create Trip Record
        const tripData = {
            driverId: currentDriverUser.uid,
            busId: assignedBusId,
            status: 'active',
            startTime: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "trips"), tripData);
        activeTripId = docRef.id;
        
        // 2. Update Bus Status to 'running'
        await updateDoc(doc(db, "buses", assignedBusId), {
            status: 'running'
        });
        
    } catch (error) {
        console.error("Error starting trip:", error);
        alert("Failed to start trip.");
    } finally {
        btnStart.disabled = false;
    }
}

async function stopTrip() {
    if (!activeTripId || !assignedBusId) return;
    
    btnStop.disabled = true;
    
    try {
        // 1. Mark trip as completed
        await updateDoc(doc(db, "trips", activeTripId), {
            status: 'completed',
            endTime: serverTimestamp()
        });
        
        // 2. Update Bus Status back to 'active' (idle)
        await updateDoc(doc(db, "buses", assignedBusId), {
            status: 'active'
        });
        
        activeTripId = null;
        
    } catch (error) {
        console.error("Error stopping trip:", error);
        alert("Failed to stop trip.");
    } finally {
        btnStop.disabled = false;
    }
}

// Formats "14:30" into "02:30 PM"
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
