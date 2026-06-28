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

// GPS State (Phase 14)
let gpsWatchId = null;
let lastGpsUpdateTime = 0;
const GPS_UPDATE_INTERVAL_MS = 5000; // 5 seconds

// DOM Elements
const btnStart = document.getElementById('btn-start-trip');
const btnStop = document.getElementById('btn-stop-trip');
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
            // Resume GPS if page was reloaded during active trip
            if (!gpsWatchId) startGpsTracking();
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
            // Stop GPS if it was running
            if (gpsWatchId) stopGpsTracking();
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
        
        // 3. Start GPS Tracking (Phase 14)
        startGpsTracking();
        
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
        
        // 2. Update Bus Status back to 'active' (idle) and clear GPS
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

let mockGpsInterval = null; // Phase 14: Mock GPS fallback

function startGpsTracking() {
    if (!navigator.geolocation) {
        updateGpsUiError("Browser does not support GPS. Starting mock GPS...");
        startMockGps();
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
            enableHighAccuracy: false, // Set to false to allow network/IP based location on desktops without GPS chips
            timeout: 20000, // Increase timeout to 20s
            maximumAge: 10000 // Allow 10s old cached locations
        }
    );
}

function stopGpsTracking() {
    if (gpsWatchId) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
    }
    if (mockGpsInterval) {
        clearInterval(mockGpsInterval);
        mockGpsInterval = null;
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
    if (gpsText) gpsText.textContent = mockGpsInterval ? "GPS Active (Mock Mode)" : "GPS Active";
    if (gpsDetails) gpsDetails.textContent = `Accuracy: ±${Math.round(accuracy)}m | Updated: ${new Date().toLocaleTimeString()}`;
    
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
            msg = "Permission Denied. Please enable location access.";
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "Location unavailable. Poor signal.";
            break;
        case error.TIMEOUT:
            msg = "GPS request timed out.";
            break;
    }
    
    updateGpsUiError(msg + " Starting mock GPS...");
    
    // Fallback to mock GPS for testing on Desktop
    if (!mockGpsInterval) {
        startMockGps();
    }
}

// ── Mock GPS Logic for Testing ──
function startMockGps() {
    console.log("Starting Mock GPS from Nabinagar towards BUBT...");
    let mockLat = 23.9056; // Nabinagar start location
    let mockLng = 90.2676;
    
    // Send immediate update
    processLocationUpdate(mockLat, mockLng, 10);
    
    // Then update every 5 seconds, moving the bus towards BUBT
    mockGpsInterval = setInterval(() => {
        mockLat -= 0.0005; // move South towards BUBT
        mockLng += 0.0005; // move East towards BUBT
        processLocationUpdate(mockLat, mockLng, 10);
    }, GPS_UPDATE_INTERVAL_MS);
}

function updateGpsUiError(msg) {
    if (gpsStatusDiv) gpsStatusDiv.classList.add('visible');
    if (gpsDot) { gpsDot.classList.remove('active'); gpsDot.classList.add('error'); }
    if (gpsText) gpsText.textContent = "GPS Error";
    if (gpsDetails) gpsDetails.textContent = msg;
}

