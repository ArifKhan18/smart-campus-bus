import { auth, db } from "./firebase-config.js";
import { collection, getDocs, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// State
let allUsers = [];
let currentFilter = 'all';
let searchQuery = '';
let unsubscribeUsers = null;

// DOM Elements
const userGrid = document.getElementById('user-grid');
const filterTabs = document.querySelectorAll('#user-filter-tabs .filter-tab');
const searchInput = document.getElementById('search-users');

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('section-users')) {
        setupUserManagement();
    }
});

function setupUserManagement() {
    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderUsers();
        });
    }

    // Filter tabs setup
    if (filterTabs.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                renderUsers();
            });
        });
    }

    // Real-time listener for users
    const usersRef = collection(db, "users");
    unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        allUsers = [];
        snapshot.forEach((doc) => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });

        // Sort by created date descending (newest first)
        allUsers.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        updateUserStats();
        renderUsers();
    }, (error) => {
        console.error("Error fetching users:", error);
        if (userGrid) {
            userGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">⚠️</div>
                    <p>Failed to load users. Check your connection or permissions.</p>
                    <p style="font-size: 0.8rem; color: #ff4d4d; margin-top: 10px;">${error.message}</p>
                </div>
            `;
        }
    });
}

function updateUserStats() {
    const total = allUsers.length;
    const students = allUsers.filter(u => u.role === 'student').length;
    const drivers = allUsers.filter(u => u.role === 'driver').length;
    const blocked = allUsers.filter(u => u.status === 'blocked').length;

    const elTotal = document.getElementById('user-stat-total');
    const elStudents = document.getElementById('user-stat-students');
    const elDrivers = document.getElementById('user-stat-drivers');
    const elBlocked = document.getElementById('user-stat-blocked');

    if (elTotal) elTotal.textContent = total;
    if (elStudents) elStudents.textContent = students;
    if (elDrivers) elDrivers.textContent = drivers;
    if (elBlocked) elBlocked.textContent = blocked;
}

function renderUsers() {
    if (!userGrid) return;

    let filteredUsers = allUsers;

    // Apply Tab Filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'blocked') {
            filteredUsers = filteredUsers.filter(u => u.status === 'blocked');
        } else {
            filteredUsers = filteredUsers.filter(u => u.role === currentFilter);
        }
    }

    // Apply Search Query
    if (searchQuery.trim() !== '') {
        filteredUsers = filteredUsers.filter(u => {
            const name = (u.name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return name.includes(searchQuery) || email.includes(searchQuery);
        });
    }

    if (filteredUsers.length === 0) {
        userGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">👥</div>
                <p>No users found matching your criteria.</p>
            </div>
        `;
        return;
    }

    userGrid.innerHTML = '';

    filteredUsers.forEach(user => {
        const card = document.createElement('div');
        card.className = 'driver-card'; // Reusing driver-card styling for consistent UI

        const dateStr = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'Unknown';
        
        let statusBadgeClass = '';
        let statusText = 'Active';
        let roleEmoji = user.role === 'admin' ? '👑' : (user.role === 'driver' ? '🚐' : '🎓');
        
        // Determine status display
        if (user.status === 'blocked') {
            statusBadgeClass = 'status-badge--rejected';
            statusText = 'Blocked';
        } else if (user.role === 'driver' && user.status === 'pending') {
            statusBadgeClass = 'status-badge--pending';
            statusText = 'Pending';
        } else if (user.role === 'driver' && user.status === 'rejected') {
            statusBadgeClass = 'status-badge--rejected';
            statusText = 'Rejected';
        } else {
            statusBadgeClass = 'status-badge--active';
        }

        // Action Buttons
        let actionsHtml = '';
        if (user.role !== 'admin') { // Prevent blocking other admins to avoid lockout
            if (user.status === 'blocked') {
                actionsHtml = `
                    <div class="driver-card__actions">
                        <button class="btn-action btn-approve" onclick="toggleUserBlock('${user.id}', 'active', '${user.role}')">
                            <span>✅</span> Unblock User
                        </button>
                    </div>
                `;
            } else {
                actionsHtml = `
                    <div class="driver-card__actions">
                        <button class="btn-action btn-reject" onclick="if(confirm('Are you sure you want to block this user? They will not be able to log in.')) toggleUserBlock('${user.id}', 'blocked', '${user.role}')">
                            <span>🚫</span> Block User
                        </button>
                    </div>
                `;
            }
        } else {
            actionsHtml = `
                <div class="driver-card__actions" style="opacity: 0.5;">
                    <span style="font-size: 0.85rem; font-style: italic;">Admin users cannot be blocked.</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="driver-card__header">
                <div class="driver-card__info">
                    <span class="driver-card__name">${user.name || 'Unknown User'}</span>
                    <span class="driver-card__email">${user.email || 'No email provided'}</span>
                </div>
                <span class="status-badge ${statusBadgeClass}">${statusText}</span>
            </div>
            
            <div class="driver-card__details">
                <div class="detail-item">
                    <span class="detail-item__label">Role</span>
                    <span class="detail-item__value" style="text-transform: capitalize;">${roleEmoji} ${user.role || 'Unknown'}</span>
                </div>
                <div class="detail-item" style="text-align: right;">
                    <span class="detail-item__label">Joined On</span>
                    <span class="detail-item__value">${dateStr}</span>
                </div>
            </div>
            
            ${actionsHtml}
        `;

        userGrid.appendChild(card);
    });
}

// Global function to toggle user block status
window.toggleUserBlock = async function (userId, newStatus, role) {
    try {
        const userRef = doc(db, "users", userId);
        
        // If unblocking a driver, we can default to 'active' assuming they were approved.
        // Or if they need approval again, admin can manage that in driver approvals.
        await updateDoc(userRef, {
            status: newStatus
        });

        const actionText = newStatus === 'blocked' ? 'blocked' : 'unblocked';
        if (window.showToast) {
            window.showToast(`User successfully ${actionText}.`, 'success');
        } else {
            alert(`User successfully ${actionText}.`);
        }
    } catch (error) {
        console.error("Error updating user status:", error);
        if (window.showToast) {
            window.showToast(`Failed to update status: ${error.message}`, 'error');
        } else {
            alert("Failed to update status.");
        }
    }
};
