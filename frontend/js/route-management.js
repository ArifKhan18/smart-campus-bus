// ========================================
// Smart Campus Bus — Route Management
// ========================================

import { db } from "./firebase-config.js";
import { collection, query, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// State
let allRoutes = [];
let allBuses = [];
let unsubscribeRoutes = null;
let stopCount = 0;

// DOM Elements
const routeGrid = document.getElementById('route-grid');
const btnAddRoute = document.getElementById('btn-add-route');
const routeModal = document.getElementById('route-modal');
const routeForm = document.getElementById('route-form');
const btnModalClose = document.getElementById('route-modal-close');
const btnModalCancel = document.getElementById('route-modal-cancel');
const routeModalTitle = document.getElementById('route-modal-title');
const routeBusSelect = document.getElementById('route-bus');
const btnAddStop = document.getElementById('btn-add-stop');
const routeStopsContainer = document.getElementById('route-stops-container');

// ── Initialization ──
export function initRouteManagement() {
    setupRoutesListener();
    fetchBuses();
    
    // Listeners
    if (btnAddRoute) btnAddRoute.addEventListener('click', openAddRouteModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
    if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);
    if (routeForm) routeForm.addEventListener('submit', handleRouteSubmit);
    if (btnAddStop) btnAddStop.addEventListener('click', () => addStopInput());
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initRouteManagement, 600);
});

// ── Real-time Listener ──
function setupRoutesListener() {
    const q = query(collection(db, "routes"));
    
    unsubscribeRoutes = onSnapshot(q, (snapshot) => {
        allRoutes = [];
        snapshot.forEach((doc) => {
            allRoutes.push({ id: doc.id, ...doc.data() });
        });
        
        allRoutes.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        updateRouteStats();
        renderRoutes();
    }, (error) => {
        console.error("Error fetching routes:", error);
        if (routeGrid) {
            routeGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">⚠️</div>
                    <p>Failed to load routes.</p>
                </div>
            `;
        }
    });
}

// ── Fetch Buses ──
async function fetchBuses() {
    try {
        const snapshot = await getDocs(collection(db, "buses"));
        allBuses = [];
        snapshot.forEach((doc) => {
            allBuses.push({ id: doc.id, ...doc.data() });
        });
        populateBusDropdown();
    } catch (error) {
        console.error("Error fetching buses:", error);
    }
}

function populateBusDropdown() {
    if (!routeBusSelect) return;
    routeBusSelect.innerHTML = '<option value="">-- Select Bus --</option>';
    allBuses.forEach(bus => {
        const option = document.createElement('option');
        option.value = bus.id;
        option.textContent = `${bus.busName} (${bus.busNumber})`;
        routeBusSelect.appendChild(option);
    });
}

// ── Stats ──
function updateRouteStats() {
    const total = allRoutes.length;
    const assigned = allRoutes.filter(r => r.assignedBus).length;
    const unassigned = total - assigned;

    document.getElementById('route-stat-total').textContent = total;
    document.getElementById('route-stat-assigned').textContent = assigned;
    document.getElementById('route-stat-unassigned').textContent = unassigned;
}

// ── Render ──
function renderRoutes() {
    if (!routeGrid) return;

    if (allRoutes.length === 0) {
        routeGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🗺️</div>
                <p>No routes added yet.</p>
            </div>
        `;
        return;
    }

    routeGrid.innerHTML = '';

    allRoutes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'bus-card'; // Reusing bus-card styles
        
        const busName = route.assignedBusName ? `[${route.assignedBusName}]` : '[Unassigned]';
        
        // Build stops list visualization
        let stopsHtml = '';
        if (route.stops && route.stops.length > 0) {
            stopsHtml = '<div class="route-stops-list">';
            route.stops.forEach(stop => {
                stopsHtml += `<div class="route-stops-list__item">${stop.name}</div>`;
            });
            stopsHtml += '</div>';
        } else {
            // Fallback to start/end if no explicit stops array is present
            stopsHtml = `
                <div class="route-stops-list">
                    <div class="route-stops-list__item">${route.startPoint}</div>
                    <div class="route-stops-list__item">${route.endPoint}</div>
                </div>
            `;
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
            
            <div class="driver-card__actions" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-card);">
                <button class="btn-action" style="background: rgba(108, 99, 255, 0.15); color: var(--accent-primary);" onclick="window.editRoute('${route.id}')">
                    <span>✏️</span> Edit
                </button>
                <button class="btn-action btn-reject" onclick="window.deleteRoute('${route.id}')">
                    <span>🗑️</span> Delete
                </button>
            </div>
        `;
        
        routeGrid.appendChild(card);
    });
}

// ── Dynamic Stops ──
function addStopInput(value = '') {
    stopCount++;
    const stopId = `stop-${stopCount}`;
    
    const div = document.createElement('div');
    div.className = 'route-stop-item';
    div.id = `container-${stopId}`;
    
    div.innerHTML = `
        <div class="form-group__input-wrapper" style="flex: 1;">
            <input type="text" class="form-group__input stop-input" placeholder="Stop Name" value="${value}" required>
        </div>
        <button type="button" class="btn-remove-stop" onclick="window.removeStop('${stopId}')" title="Remove stop">×</button>
    `;
    
    routeStopsContainer.appendChild(div);
}

window.removeStop = function(stopId) {
    const el = document.getElementById(`container-${stopId}`);
    if (el) el.remove();
};

// ── Modal Logic ──
function openAddRouteModal() {
    routeForm.reset();
    document.getElementById('route-id').value = '';
    routeStopsContainer.innerHTML = '';
    stopCount = 0;
    
    // Add one empty stop by default
    addStopInput();
    
    routeModalTitle.textContent = "Add New Route";
    routeModal.classList.add('active');
}

window.editRoute = function(routeId) {
    const route = allRoutes.find(r => r.id === routeId);
    if (!route) return;
    
    routeForm.reset();
    document.getElementById('route-id').value = route.id;
    document.getElementById('route-name').value = route.routeName;
    document.getElementById('route-start').value = route.startPoint;
    document.getElementById('route-end').value = route.endPoint;
    
    if (route.assignedBus) {
        document.getElementById('route-bus').value = route.assignedBus;
    }
    
    // Populate stops
    routeStopsContainer.innerHTML = '';
    stopCount = 0;
    
    if (route.stops && route.stops.length > 2) {
        // Exclude first and last which are start/end
        const intermediateStops = route.stops.slice(1, -1);
        intermediateStops.forEach(stop => {
            addStopInput(stop.name);
        });
    }
    
    if (routeStopsContainer.children.length === 0) {
        addStopInput(); // Provide at least one empty slot
    }
    
    routeModalTitle.textContent = "Edit Route";
    routeModal.classList.add('active');
};

function closeModal() {
    routeModal.classList.remove('active');
}

// ── Submit Logic ──
async function handleRouteSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('route-modal-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    
    try {
        const routeId = document.getElementById('route-id').value;
        const routeName = document.getElementById('route-name').value.trim();
        const startPoint = document.getElementById('route-start').value.trim();
        const endPoint = document.getElementById('route-end').value.trim();
        const busId = document.getElementById('route-bus').value;
        
        // Gather intermediate stops
        const stopInputs = document.querySelectorAll('.stop-input');
        const intermediateStops = Array.from(stopInputs)
                                    .map(input => input.value.trim())
                                    .filter(val => val !== '');
        
        // Build full stops array
        const allStops = [];
        let order = 1;
        
        allStops.push({ name: startPoint, order: order++ });
        intermediateStops.forEach(stop => {
            allStops.push({ name: stop, order: order++ });
        });
        allStops.push({ name: endPoint, order: order++ });
        
        // Find bus details
        let busName = null;
        if (busId) {
            const bus = allBuses.find(b => b.id === busId);
            if (bus) busName = bus.busName;
        }

        if (routeId) {
            // Update
            const docRef = doc(db, "routes", routeId);
            await updateDoc(docRef, {
                routeName,
                startPoint,
                endPoint,
                stops: allStops,
                assignedBus: busId || null,
                assignedBusName: busName,
                updatedAt: serverTimestamp()
            });
            
            // Also update bus's route field if a bus was selected
            if (busId) {
                await updateDoc(doc(db, "buses", busId), {
                    route: routeName
                });
            }
            
            if(window.showToast) window.showToast("Route updated successfully!", "success");
        } else {
            // Add
            const newDocRef = doc(collection(db, "routes"));
            await setDoc(newDocRef, {
                routeName,
                startPoint,
                endPoint,
                stops: allStops,
                assignedBus: busId || null,
                assignedBusName: busName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            // Also update bus's route field if a bus was selected
            if (busId) {
                await updateDoc(doc(db, "buses", busId), {
                    route: routeName
                });
            }
            
            if(window.showToast) window.showToast("New route added successfully!", "success");
        }
        
        closeModal();
    } catch (error) {
        console.error("Error saving route:", error);
        if(window.showToast) window.showToast(`Error: ${error.message}`, "error");
        else alert(`Error saving route: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ── Delete Logic ──
window.deleteRoute = async function(routeId) {
    if (!confirm("Are you sure you want to delete this route?")) return;
    
    try {
        await deleteDoc(doc(db, "routes", routeId));
        if(window.showToast) window.showToast("Route deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting route:", error);
        if(window.showToast) window.showToast(`Error: ${error.message}`, "error");
    }
};
