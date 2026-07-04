// ========================================
// Smart Campus Bus — Driver Dashboard
// ========================================

import { db } from "./firebase-config.js";
import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const translations = {
    en: {
        hello: "Hello,",
        sign_out: "Sign Out",
        start: "START",
        cancel: "✕ CANCEL",
        stop: "STOP",
        delay: "DELAY",
        ready_next_trip: "Ready for next trip",
        gps_offline: "GPS Offline",
        location_not_available: "Location not available",
        assigned_bus: "ASSIGNED BUS",
        todays_schedule: "TODAY'S DUTY SCHEDULE",
        loading_schedules: "Loading schedules...",
        no_bus: "No Bus Assigned",
        contact_admin: "Please contact admin to assign a bus.",
        cannot_start: "Cannot start trip: No bus assigned",
        no_schedules: "No schedules assigned for today.",
        assigned_duty: "Assigned Duty",
        trip_in_progress: "📍 TRIP IN PROGRESS...",
        connecting_gps: "Connecting to GPS...",
        waiting_signal: "Waiting for signal",
        gps_active: "GPS Active",
        gps_error: "GPS Error",
        connecting: "CONNECTING",
        accuracy: "Accuracy",
        updated: "Updated",
        trip_cancelled: "Trip start cancelled.",
        cannot_start_gps_error: "Cannot start trip.",
        failed_start_db: "Failed to start trip due to database error.",
        confirm_delay: "Are you sure you want to mark the bus as delayed?",
        delay_sent: "Delay notification sent to students.",
        delay_failed: "Failed to send delay notification.",
        stop_failed: "Failed to stop trip."
    },
    bn: {
        hello: "হ্যালো,",
        sign_out: "লগ আউট",
        start: "শুরু করুন",
        cancel: "✕ বাতিল",
        stop: "থামান",
        delay: "দেরি",
        ready_next_trip: "পরবর্তী ট্রিপের জন্য প্রস্তুত",
        gps_offline: "জিপিএস অফলাইন",
        location_not_available: "অবস্থান উপলব্ধ নেই",
        assigned_bus: "নির্ধারিত বাস",
        todays_schedule: "আজকের ডিউটি শিডিউল",
        loading_schedules: "শিডিউল লোড হচ্ছে...",
        no_bus: "কোনো বাস বরাদ্দ নেই",
        contact_admin: "বাস বরাদ্দের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।",
        cannot_start: "ট্রিপ শুরু করা যাচ্ছে না: কোনো বাস বরাদ্দ নেই",
        no_schedules: "আজকের জন্য কোনো শিডিউল বরাদ্দ নেই।",
        assigned_duty: "নির্ধারিত ডিউটি",
        trip_in_progress: "📍 ট্রিপ চলছে...",
        connecting_gps: "জিপিএস সংযোগ হচ্ছে...",
        waiting_signal: "সিগন্যালের জন্য অপেক্ষা করা হচ্ছে",
        gps_active: "জিপিএস সক্রিয়",
        gps_error: "জিপিএস ত্রুটি",
        connecting: "সংযোগ হচ্ছে",
        accuracy: "সঠিকতা",
        updated: "আপডেট",
        trip_cancelled: "ট্রিপ শুরু করা বাতিল করা হয়েছে।",
        cannot_start_gps_error: "ট্রিপ শুরু করা যাচ্ছে না।",
        failed_start_db: "ডাটাবেস ত্রুটির কারণে ট্রিপ শুরু করা যায়নি।",
        confirm_delay: "আপনি কি নিশ্চিত যে আপনি বাসটিকে বিলম্বিত হিসাবে চিহ্নিত করতে চান?",
        delay_sent: "শিক্ষার্থীদের কাছে বিলম্বের বিজ্ঞপ্তি পাঠানো হয়েছে।",
        delay_failed: "বিলম্বের বিজ্ঞপ্তি পাঠাতে ব্যর্থ হয়েছে।",
        stop_failed: "ট্রিপ থামাতে ব্যর্থ হয়েছে।"
    }
};

let currentLang = localStorage.getItem('driver_lang') || 'en';

function getTranslation(key) {
    return translations[currentLang][key] || key;
}

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'bn' : 'en';
    localStorage.setItem('driver_lang', currentLang);
    location.reload(); // Reload to apply language to all dynamic states
};

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

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.textContent = currentLang === 'en' ? 'বাংলা' : 'English';
        langBtn.addEventListener('click', window.toggleLanguage);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    applyTranslations();
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
                    showErrorPopup(getTranslation('trip_cancelled'));
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
            if (assignedBusEl) assignedBusEl.textContent = getTranslation('no_bus');
            if (scheduleListEl) scheduleListEl.innerHTML = `
                <div class="schedule-item">
                    <span class="schedule-time" style="color: var(--text-primary);">${getTranslation('contact_admin')}</span>
                </div>
            `;
            if(btnStart) {
                btnStart.style.opacity = '0.5';
                btnStart.disabled = true;
                statusText.textContent = getTranslation('cannot_start');
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
                        <span class="schedule-time" style="color: var(--text-primary);">${getTranslation('no_schedules')}</span>
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
                    <span class="schedule-route">${getTranslation('assigned_duty')}</span>
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
                statusText.textContent = getTranslation('trip_in_progress');
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
        <span class="btn-text" style="font-size: 1rem;">${getTranslation('connecting')}</span>
    `;
    btnStart.style.background = '#f59e0b';
    btnStart.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.3)';
    
    if (statusText) {
        statusText.textContent = getTranslation('connecting_gps');
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
    
    if (!confirm(getTranslation('confirm_delay'))) return;
    
    btnDelay.disabled = true;
    try {
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_delayed',
            message: `${assignedBusName} is currently delayed due to traffic or other issues.`,
            timestamp: serverTimestamp()
        });
        alert(getTranslation('delay_sent'));
    } catch (error) {
        console.error("Error sending delay notification:", error);
        alert(getTranslation('delay_failed'));
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
        alert(getTranslation('stop_failed'));
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
    if (gpsText) gpsText.textContent = getTranslation('connecting_gps');
    if (gpsDetails) gpsDetails.textContent = getTranslation('waiting_signal');
    
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
    if (gpsText) gpsText.textContent = getTranslation('gps_offline');
    if (gpsDetails) gpsDetails.textContent = getTranslation('location_not_available');
}

async function handleGpsSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    await processLocationUpdate(latitude, longitude, accuracy);
}

async function processLocationUpdate(latitude, longitude, accuracy) {
    const now = Date.now();
    
    // Update UI immediately
    if (gpsDot) { gpsDot.classList.remove('error'); gpsDot.classList.add('active'); }
    if (gpsText) gpsText.textContent = getTranslation('gps_active');
    if (gpsDetails) gpsDetails.textContent = `${getTranslation('accuracy')}: ±${Math.round(accuracy)}m | ${getTranslation('updated')}: ${new Date().toLocaleTimeString()}`;
    
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
        showErrorPopup(msg + " " + getTranslation('cannot_start_gps_error'));
        resetStartButton();
        stopGpsTracking();
    }
}

function updateGpsUiError(msg) {
    if (gpsStatusDiv) gpsStatusDiv.classList.add('visible');
    if (gpsDot) { gpsDot.classList.remove('active'); gpsDot.classList.add('error'); }
    if (gpsText) gpsText.textContent = getTranslation('gps_error');
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
        showErrorPopup(getTranslation('failed_start_db'));
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
            <span class="btn-text">${getTranslation('start')}</span>
        `;
        btnStart.style.background = ''; // reset to class default
        btnStart.style.boxShadow = '';
    }
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'none';
    if(btnStop) btnStop.style.display = 'none';
    if(btnDelay) btnDelay.classList.add('hidden');
    if(statusText) {
        statusText.textContent = getTranslation('ready_next_trip');
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

