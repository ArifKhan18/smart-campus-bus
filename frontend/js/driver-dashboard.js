// ========================================
// Smart Campus Bus — Driver Dashboard
// ========================================

import { db } from "./firebase-config.js";
import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentDriverUser = null;
let assignedBusId = null;
let assignedBusName = "Bus";
let activeTripId = null;

// GPS State (Phase 14)
let gpsWatchId = null;
let lastGpsUpdateTime = 0;
const GPS_UPDATE_INTERVAL_MS = 5000; // 5 seconds
let pendingTripStart = false; // Flag to indicate we are connecting to GPS to start a trip

// DOM Elements
const btnStart = document.getElementById('btn-start-trip');
const btnStop = document.getElementById('btn-stop-trip');
const btnDelay = document.getElementById('btn-delay-bus');
const btnCancelConnecting = document.getElementById('btn-cancel-connecting');
const statusText = document.getElementById('trip-status');
const assignedBusEl = document.getElementById('assigned-bus');
const scheduleListEl = document.getElementById('duty-schedule-list');

// GPS UI Elements
const gpsStatusDiv = document.getElementById('gps-status');
const gpsDot = document.getElementById('gps-dot');
const gpsText = document.getElementById('gps-text');
const gpsDetails = document.getElementById('gps-details');

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
        if(btnDelay) btnDelay.addEventListener("click", delayBus);
        if(btnCancelConnecting) {
            btnCancelConnecting.addEventListener("click", () => {
                if (pendingTripStart) {
                    showErrorPopup("Trip start cancelled.");
                    resetStartButton();
                    stopGpsTracking();
                }
            });
        }
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
            assignedBusName = busData.busName;
            
            if (assignedBusEl) assignedBusEl.textContent = busData.busName;
            
            // 2. Fetch Schedules for this bus
            fetchSchedules();
            
            // 3. Check for active trips
            checkActiveTrips();
        } else {
            if (assignedBusEl) assignedBusEl.textContent = "No Bus Assigned";
            if (scheduleListEl) scheduleListEl.innerHTML = `
                <div class="schedule-item">
                    <span class="schedule-time" style="color: var(--text-primary);">Please contact admin to assign a bus.</span>
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
                        <span class="schedule-time" style="color: var(--text-primary);">No schedules assigned for today.</span>
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
            if(btnDelay) btnDelay.classList.remove('hidden');
            if(statusText) {
                statusText.textContent = '📍 TRIP IN PROGRESS...';
                statusText.style.color = 'var(--accent-success)';
                statusText.style.borderColor = 'rgba(0, 200, 83, 0.2)';
                statusText.style.background = 'rgba(0, 200, 83, 0.05)';
            }
            // Resume GPS if page was reloaded during active trip
            if (!gpsWatchId) startGpsTracking();
        } else {
            // Stop GPS if it was running and we aren't trying to start
            if (gpsWatchId && !pendingTripStart) stopGpsTracking();
            
            if (pendingTripStart) return; // Don't reset UI if connecting to GPS
            
            resetStartButton();
        }
    });
}

async function startTrip() {
    if (!assignedBusId || !currentDriverUser) return;
    
    // UI changes for connecting state
    btnStart.disabled = true;
    btnStart.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text" style="font-size: 1rem;">CONNECTING</span>
    `;
    btnStart.style.background = '#f59e0b';
    btnStart.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.3)';
    
    if (statusText) {
        statusText.textContent = 'Connecting to GPS...';
        statusText.style.color = '#f59e0b';
        statusText.style.borderColor = 'rgba(245, 158, 11, 0.2)';
        statusText.style.background = 'rgba(245, 158, 11, 0.05)';
    }
    
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'block';
    
    // 1. Start GPS Tracking with connecting flag
    startGpsTracking(true);
}

async function delayBus() {
    if (!activeTripId || !assignedBusId) return;
    
    if (!confirm("Are you sure you want to mark the bus as delayed?")) return;
    
    btnDelay.disabled = true;
    try {
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_delayed',
            message: `${assignedBusName} is currently delayed due to traffic or other issues.`,
            timestamp: serverTimestamp()
        });
        alert("Delay notification sent to students.");
    } catch (error) {
        console.error("Error sending delay notification:", error);
        alert("Failed to send delay notification.");
    } finally {
        btnDelay.disabled = false;
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
        
        // 2. Add Notification for trip completion
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_stopped',
            message: `${assignedBusName} has completed its trip.`,
            timestamp: serverTimestamp()
        });
        
        // 3. Update Bus Status back to 'active' (idle) and clear GPS
        await updateDoc(doc(db, "buses", assignedBusId), {
            status: 'active',
            currentLocation: null // Clear location when trip stops
        });
        
        activeTripId = null;
        
        // 3. Stop GPS Tracking (Phase 14)
        stopGpsTracking();
        
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

function startGpsTracking(isStartingTrip = false) {
    if (isStartingTrip) pendingTripStart = true;
    if (!navigator.geolocation) {
        updateGpsUiError("Browser does not support GPS.");
        return;
    }
    if (gpsStatusDiv) gpsStatusDiv.classList.add('visible');
    if (gpsDot) { gpsDot.classList.remove('error'); gpsDot.classList.add('active'); }
    if (gpsText) gpsText.textContent = "Connecting to GPS...";
    if (gpsDetails) gpsDetails.textContent = "Waiting for signal";
    
    // Clear any existing watch
    if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);
    
    gpsWatchId = navigator.geolocation.watchPosition(
        handleGpsSuccess,
        handleGpsError,
        {
            enableHighAccuracy: true, // Force high accuracy / fresh GPS
            timeout: 20000, // Increase timeout to 20s
            maximumAge: 0 // Do not allow cached locations!
        }
    );
}

function stopGpsTracking() {
    if (gpsWatchId) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
    }
    
    if (gpsStatusDiv) gpsStatusDiv.classList.remove('visible');
    if (gpsDot) { gpsDot.classList.remove('active', 'error'); }
    if (gpsText) gpsText.textContent = "GPS Offline";
    if (gpsDetails) gpsDetails.textContent = "Location not available";
}

async function handleGpsSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    await processLocationUpdate(latitude, longitude, accuracy);
}

async function processLocationUpdate(latitude, longitude, accuracy) {
    const now = Date.now();
    
    // Update UI immediately
    if (gpsDot) { gpsDot.classList.remove('error'); gpsDot.classList.add('active'); }
    if (gpsText) gpsText.textContent = "GPS Active";
    if (gpsDetails) gpsDetails.textContent = `Accuracy: ±${Math.round(accuracy)}m | Updated: ${new Date().toLocaleTimeString()}`;
    
    if (pendingTripStart) {
        pendingTripStart = false;
        await confirmTripStart();
    }
    
    // Throttle Firestore updates (e.g. every 5 seconds)
    if (now - lastGpsUpdateTime < GPS_UPDATE_INTERVAL_MS) {
        return; // Skip this update to save Firestore writes
    }
    
    if (!assignedBusId) return;
    
    try {
        await updateDoc(doc(db, "buses", assignedBusId), {
            currentLocation: {
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString()
            }
        });
        lastGpsUpdateTime = now;
        console.log(`[GPS] Location updated: ${latitude}, ${longitude}`);
    } catch (error) {
        console.error("Failed to update GPS in Firestore:", error);
    }
}

function handleGpsError(error) {
    console.error("GPS Error:", error);
    let msg = "GPS Error";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = "Permission Denied by browser.";
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "Location unavailable. (Check Windows Location Settings if on PC)";
            break;
        case error.TIMEOUT:
            msg = "GPS request timed out.";
            break;
    }
    console.warn(`GPS Error Code: ${error.code}, Message: ${error.message}`);
    
    updateGpsUiError(msg);
    
    if (pendingTripStart) {
        showErrorPopup(msg + " Cannot start trip.");
        resetStartButton();
        stopGpsTracking();
    }
}

function updateGpsUiError(msg) {
    if (gpsStatusDiv) gpsStatusDiv.classList.add('visible');
    if (gpsDot) { gpsDot.classList.remove('active'); gpsDot.classList.add('error'); }
    if (gpsText) gpsText.textContent = "GPS Error";
    if (gpsDetails) gpsDetails.textContent = msg;
}

// ── Added Helper Functions ──

async function confirmTripStart() {
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'none';
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
        
        // 3. Send Notification
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_started',
            message: `${assignedBusName} has started its trip.`,
            timestamp: serverTimestamp()
        });
        
    } catch (error) {
        console.error("Error confirming trip start:", error);
        resetStartButton();
        showErrorPopup("Failed to start trip due to database error.");
        stopGpsTracking();
    }
}

function resetStartButton() {
    pendingTripStart = false;
    activeTripId = null;
    if(btnStart) {
        btnStart.disabled = false;
        btnStart.style.display = 'flex';
        btnStart.innerHTML = `
            <span class="btn-icon">▶</span>
            <span class="btn-text">START</span>
        `;
        btnStart.style.background = ''; // reset to class default
        btnStart.style.boxShadow = '';
    }
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'none';
    if(btnStop) btnStop.style.display = 'none';
    if(btnDelay) btnDelay.classList.add('hidden');
    if(statusText) {
        statusText.textContent = 'Ready for next trip';
        statusText.style.color = 'var(--text-muted)';
        statusText.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        statusText.style.background = 'rgba(255, 255, 255, 0.03)';
    }
}

function showErrorPopup(message) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(239, 68, 68, 0.95)';
    popup.style.color = '#fff';
    popup.style.padding = '15px 25px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.4)';
    popup.style.zIndex = '9999';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.gap = '10px';
    popup.style.fontFamily = "'Inter', sans-serif";
    popup.style.fontWeight = '500';
    popup.style.animation = 'slideDown 0.3s ease-out';
    
    popup.innerHTML = `
        <span style="font-size: 1.5rem;">⚠️</span>
        <span>${message}</span>
        <button style="background:transparent;border:none;color:#fff;font-size:1.2rem;cursor:pointer;margin-left:10px;">&times;</button>
    `;
    
    if (!document.getElementById('popup-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-styles';
        style.textContent = `
            @keyframes slideDown {
                from { top: -50px; opacity: 0; }
                to { top: 20px; opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(popup);
    
    const closeBtn = popup.querySelector('button');
    const closePopup = () => {
        popup.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => popup.remove(), 300);
    };
    
    closeBtn.addEventListener('click', closePopup);
    setTimeout(closePopup, 5000); // auto close after 5 seconds
}

