# Smart Campus Bus Tracking System - Agent & Architecture Guide

## Project Overview

Smart Campus Bus Tracking System is a full-stack web application designed for university students, drivers, and administrators.

The goal is to allow students to:
- View bus schedules, routes, and stops
- Track buses in real-time
- Receive ETA information
- Communicate through bus-specific group chats
- Verify accounts securely using OTP via email

The project is developed incrementally and phase-by-phase.

---

## Technology Stack

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Testing**: Playwright (E2E)
- **Maps**: OpenStreetMap (OSM) & Leaflet.js
- **Reason for Map Selection**: OpenStreetMap is free, open-source, and highly suitable for real-time tracking without Google Maps API pricing limits.

### Backend
- **Framework**: C# ASP.NET Core Web API (.NET 8)
- **Services**: Brevo API (for Email OTP)
- **Containerization**: Docker
- **Testing**: xUnit/NUnit (SmartCampusBus.Tests)

### Database & Authentication
- **Database**: Firebase Firestore (NoSQL, initialized via Admin SDK in backend)
- **Authentication**: Firebase Authentication (Secured via JWT in ASP.NET Core)

---

## User Roles & Workflows

### Student
- **Registration**: Requires email verification using an OTP sent via Brevo API.
- **Access**: View bus list, schedules, routes, stops, and live status.
- **Live Features**: View live location, ETA, and join bus-specific chats.

### Driver
- **Registration**: Selects assigned bus during sign up.
- **Approval Flow**: Status is "Pending Approval" until an Admin reviews and approves it.
- **Trip Management**: Start/End trips, broadcast live GPS, and send alerts.

### Admin
- **Approval System**: Approve or reject driver accounts.
- **Core Management**: CRUD for Buses, Routes, Schedules, Users, and Announcements.
- **Analytics & Reports**: View live active buses, trip statistics, and generate system reports.

---

## Authentication Flow

1. User selects role (Student / Driver / Admin).
2. Registration triggers the Backend Auth service.
3. Student receives OTP via Email (Brevo API). Upon successful entry, account is activated.
4. Driver registers and selects a bus. Account requires manual Admin approval.
5. All logins exchange credentials for a Firebase JWT token which is passed via `Bearer` token to the C# Backend endpoints.

---

## Data Models (Firestore Collections)

### users
- `id`, `name`, `email`, `role`, `status`, `createdAt`

### buses
- `busId`, `busName`, `busNumber`, `assignedDriver`, `routeId`, `scheduleId`, `capacity`

### routes
- `routeId`, `startPoint`, `endPoint`, `stops` (Array of coordinates/names)

### schedules
- `scheduleId`, `busId`, `departureTimes`

### trips & locations
- Stores active trip data and live GPS updates (Latitude, Longitude, Timestamp).

### driverApprovals
- Tracks pending driver registrations.

### chatRooms & messages
- Bus-specific chat rooms and individual timestamped messages.

### announcements
- Campus-wide alerts and updates posted by Admins.

---

## System Workflows

### Real-time Tracking System
- **Driver Device**: Accesses GPS, sends Latitude/Longitude every 5-10 seconds to the Backend/Firebase.
- **Student Device**: Subscribes to Firebase location updates, rendering a moving marker on the Leaflet map.

### ETA System
- Calculated based on the predefined Route, subsequent Bus Stops, and current Bus Position (not the student's personal location).

---

## Development Roadmap (Status)

### ✅ Phase 1: Project Foundation & UI
- GitHub Repo, Frontend Setup, Initial HTML/CSS pages, Role Selection UI.

### ✅ Phase 2: Secure Authentication
- Firebase Auth, JWT integration with C# Backend, Brevo Email OTP verification.

### ✅ Phase 3: Role Management & Approvals
- Driver approval workflow via Admin Dashboard.

### ✅ Phase 4-7: Admin Management Modules
- CRUD implementation for Buses, Routes, Schedules, and Announcements.

### ✅ Phase 8-10: Driver & Student Dashboards
- Trip startup, running status flags, Student bus search views.

### ✅ Phase 11-16: Mapping & Live Tracking
- OpenStreetMap + Leaflet integration, Route drawing, Driver GPS broadcasting, Student live view.

### ✅ Phase 17-20: Advanced Features
- Distance calculation, ETA System, Notifications, Alerts, and Group Chat per bus.

### ✅ Phase 21-23: Analytics & Backend Overhaul
- Admin Analytics/Reports JS. Migration of business logic to C# ASP.NET Core. Setup Docker.

### ✅ Phase 24: Testing & Stability
- Playwright E2E tests added to Frontend. Backend testing framework initialized.

### ⏳ Phase 25: Final Polish & Mobile Optimization (In Progress)
- UI/UX polish, bug fixes, mobile responsiveness across all dashboards.

### ⏳ Phase 26: Production Deployment
- Frontend to Vercel/Netlify. Backend to Render/Railway via Docker.

---

## Development Rules

- **API First**: Always route critical data through the C# ASP.NET Core API rather than direct client-to-Firebase calls where business logic is needed.
- **Phase Completion**: Do not start a new phase until the current one is fully approved and tested.
- **Clean Architecture**: Backend should maintain Separation of Concerns (Controllers -> Services -> Repositories/Firebase SDK).
- **Testing**: E2E tests for frontend logic and Unit tests for backend logic must be maintained.