# 🚌 Smart Campus Bus Tracking System

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)

Welcome to the **Smart Campus Bus Tracking System**! 🎓

This project is a complete, easy-to-use full-stack application built specifically for university students, drivers, and administrators. Our main goal is to eliminate the guesswork of "Where is the bus?" by providing **Live GPS Tracking**, real-time schedule updates, and instant notifications. 

---

## ✨ Key Features & User Roles

### 👨‍🎓 Student
- **Live Tracking**: View the live GPS location of running buses on an interactive map.
- **Schedules & Routes**: View all available routes, bus stops, and schedules.
- **Account Verification**: Secure OTP-based email verification upon registration.
- **Real-Time Data**: Get ETA (Estimated Time of Arrival) and distance.
- **Notifications**: Receive alerts for delays or emergencies.
- **Group Chats**: Participate in live group chats for specific buses.

### 🚌 Driver
- **Trip Management**: Start and stop trips with a single click.
- **Live Location Broadcast**: Broadcasts GPS location to the server automatically while driving.
- **Approval System**: Needs Admin approval to activate their account.
- **Alerts**: Can send delay alerts or emergency notifications to students.

### 👨‍💼 Admin
- **Dashboard & Analytics**: Complete overview of the system's statistics and usage.
- **Management**: Add, edit, or delete Buses, Routes, and Schedules.
- **User Control**: Approve/reject drivers, manage student accounts.
- **Announcements**: Post campus-wide announcements.
- **Reports**: Generate and view system reports.

---

## 🛠️ Technology Stack

Our stack is divided into a lightweight frontend and a robust backend API.

**Frontend:**
- **HTML5, CSS3 (Vanilla), JS (ES6+)**: Fast, clean, no heavy frameworks.
- **Leaflet.js & OpenStreetMap**: For interactive, real-time map rendering.
- **Playwright**: End-to-End (E2E) testing framework.

**Backend & Database:**
- **C# ASP.NET Core Web API**: High-performance backend handling core logic.
- **Firebase Firestore**: Real-time NoSQL database.
- **Firebase Authentication**: Secure user identity management.
- **Brevo API (EmailService)**: Sends OTPs and transactional emails securely.
- **Docker**: Containerized backend for easy deployment.

---

## 📂 Complete Folder Structure

```text
smart-campus-bus/
├── README.md                           # Main project documentation
├── Agent.md                            # Detailed developer logic & architectural roadmap
├── backend/                            # Server-Side Application (ASP.NET Core)
│   ├── SmartCampusBus.Api/             # Main API Project
│   │   ├── Config/                     # Configuration files
│   │   │   └── FirebaseConfig.cs       # Initializes Firebase Admin SDK credentials
│   │   ├── Controllers/                # API Endpoints
│   │   │   ├── AnnouncementController.cs # Handles Announcement CRUD operations
│   │   │   ├── AuthController.cs       # Handles User Authentication (Login/Register)
│   │   │   ├── BusController.cs        # Handles Bus CRUD operations
│   │   │   ├── RouteController.cs      # Handles Route CRUD operations
│   │   │   └── ScheduleController.cs   # Handles Schedule CRUD operations
│   │   ├── Models/                     # Data Models & DTOs
│   │   │   ├── Announcement.cs         # Announcement data structure
│   │   │   ├── Bus.cs                  # Bus data structure
│   │   │   ├── Route.cs                # Route data structure
│   │   │   ├── RouteStop.cs            # Route Stop data structure
│   │   │   ├── Schedule.cs             # Schedule data structure
│   │   │   └── User.cs                 # User data structure
│   │   ├── Properties/
│   │   │   └── launchSettings.json     # Debug/run configurations for Visual Studio
│   │   ├── Services/                   # Business Logic
│   │   │   ├── AnnouncementService.cs  # Logic for Announcements
│   │   │   ├── AuthService.cs          # Logic for User Auth & Roles
│   │   │   ├── BusService.cs           # Logic for Bus Management
│   │   │   ├── EmailService.cs         # Logic for sending OTP via Brevo API
│   │   │   ├── RouteService.cs         # Logic for Routes
│   │   │   └── ScheduleService.cs      # Logic for Schedules
│   │   ├── appsettings.Development.json # Environment specific configs
│   │   ├── appsettings.json            # Main Database & API keys config
│   │   ├── Dockerfile                  # Instructions to build the Docker image
│   │   ├── Program.cs                  # Entry point & Dependency Injection setup
│   │   ├── SmartCampusBus.Api.csproj   # C# Project dependencies file
│   │   └── SmartCampusBus.Api.http     # HTTP test requests file
│   └── SmartCampusBus.Tests/           # Unit Testing Project
│       ├── BusServiceTests.cs          # Tests for Bus Service logic
│       ├── SmartCampusBus.Tests.csproj # Testing dependencies
│       └── UnitTest1.cs                # Basic test template
└── frontend/                           # Client-Side Application
    ├── css/                            # Stylesheets
    │   └── style.css                   # Main design and layout styling
    ├── js/                             # Core JavaScript Logic
    │   ├── admin-dashboard.js          # Logic for Admin dashboard interface
    │   ├── analytics.js                # Logic for rendering Admin analytics charts
    │   ├── announcement-management.js  # UI logic for managing announcements
    │   ├── api.js                      # Centralized API fetch requests
    │   ├── app.js                      # General app logic & animations
    │   ├── auth-guard.js               # Route protection (redirects unauthenticated users)
    │   ├── auth.js                     # Login & Registration logic
    │   ├── bus-management.js           # UI logic for managing buses (Admin)
    │   ├── dashboard.js                # Shared dashboard functionalities
    │   ├── driver-dashboard.js         # Logic for Driver interface (Starting trips, GPS)
    │   ├── firebase-config.js          # Firebase client initialization
    │   ├── report-management.js        # Logic for generating Admin reports
    │   ├── role-select.js              # Logic for Role Selection page
    │   ├── route-management.js         # UI logic for mapping and managing routes (Admin)
    │   ├── schedule-management.js      # UI logic for managing schedules (Admin)
    │   ├── student-dashboard.js        # Logic for Student interface (Live tracking, Maps)
    │   ├── temp_check.js               # Temporary checks or admin validations
    │   ├── theme.js                    # Light/Dark mode toggling logic
    │   └── user-management.js          # Logic for approving/rejecting users (Admin)
    ├── pages/                          # HTML View Pages
    │   ├── admin-dashboard.html        # Secure control panel for Administrators
    │   ├── dashboard.html              # Base dashboard template
    │   ├── driver-dashboard.html       # Portal for drivers to manage trips
    │   ├── login.html                  # User login page
    │   ├── register.html               # New user registration page
    │   ├── role-select.html            # Screen to choose Student/Driver/Admin
    │   ├── student-dashboard.html      # Portal for students to track buses
    │   ├── verify-otp.html             # Screen for Email OTP verification
    │   └── components/                 
    │       └── toast.html              # Reusable popup notification UI
    ├── tests/                          # E2E Tests with Playwright
    │   ├── example.spec.ts             # Demo UI tests
    │   └── ui.spec.ts                  # Application specific UI tests
    ├── index.html                      # Main landing homepage
    ├── package-lock.json               # Locked versions of Node packages
    ├── package.json                    # Node.js dependencies (Playwright)
    └── playwright.config.ts            # Configuration for E2E testing
```

---

## 🚀 How to Run the Project Locally

Follow these instructions to get both the frontend and backend running on your local machine.

### Prerequisites
- **.NET 8 SDK** (or newer) installed for the backend.
- **Node.js** installed for frontend testing tools.
- **Live Server** extension (if using VS Code) for the frontend.

### 1. Clone the Repository
```bash
git clone https://github.com/ArifKhan18/smart-campus-bus.git
cd smart-campus-bus
```

### 2. Backend Setup (ASP.NET Core)
The backend requires Firebase credentials and Brevo Email API keys to function.

1. Navigate to the backend directory:
   ```bash
   cd backend/SmartCampusBus.Api
   ```
2. **Add Credentials**:
   - Place your Firebase `serviceAccountKey.json` inside this folder.
   - Update `appsettings.json` or `appsettings.Development.json` with your Firebase Project ID and Brevo API Key:
     ```json
     {
       "Firebase": {
         "ProjectId": "your-firebase-project-id"
       },
       "EmailSettings": {
         "BrevoApiKey": "your-brevo-api-key",
         "SenderEmail": "no-reply@yourdomain.com"
       }
     }
     ```
3. **Run the API**:
   ```bash
   dotnet restore
   dotnet run
   ```
   *The API will usually run on `https://localhost:5001` or `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Open `js/api.js` and ensure the `API_BASE_URL` points to your running backend (e.g., `https://localhost:5001/api`).
3. Open `index.html` using **Live Server** in VS Code, or simply double-click the file to open in your browser.

*(Optional)* Run E2E Tests:
```bash
npm install
npx playwright test
```

---

## 🤝 How to Contribute

We follow a professional Git workflow. If you want to contribute, please adhere to these guidelines:

1. **Fork the Repository**: Copy the project to your own GitHub account.
2. **Clone your Fork**: `git clone https://github.com/YourUsername/smart-campus-bus.git`
3. **Create a Feature Branch**: Always branch out from `main`. Use a descriptive name:
   ```bash
   git checkout -b feature/user-authentication
   # or for bug fixes:
   git checkout -b bugfix/map-rendering-issue
   ```
4. **Commit Standard**: Write clear, descriptive commit messages.
   ```bash
   git commit -m "feat: added OTP verification using Brevo API"
   ```
5. **Push and PR**: Push the branch to your fork and submit a Pull Request to the main repository. Ensure your code passes all tests and aligns with our formatting.

---

## 📋 Development Roadmap

| Phase | Feature Name | Status |
| :---: | :--- | :---: |
| **0-2**| Project Foundation, UI & Secure Auth (OTP via Brevo) | ✅ Complete |
| **3-4**| Role Management & Driver Approvals | ✅ Complete |
| **5-7**| Admin: CRUD for Buses, Routes, & Schedules | ✅ Complete |
| **8** | Student Bus Search & View | ✅ Complete |
| **9-10**| Driver Trip Setup & Running Status | ✅ Complete |
| **11-13**| OpenStreetMap, Leaflet Integration & Route drawing | ✅ Complete |
| **14-16**| GPS Collection & Live Bus Tracking | ✅ Complete |
| **17-18**| Distance Calculation & ETA System | ✅ Complete |
| **19-20**| Notifications, Alerts & Group Chat | ✅ Complete |
| **21-22**| Admin: Analytics, Reports & Announcements | ✅ Complete |
| **23**| Backend API Migration (ASP.NET Core) & Dockerization | ✅ Complete |
| **24**| Playwright E2E Testing & Unit Tests | ✅ Complete |
| **25**| Final Polish, Bug Fixes & Mobile Responsiveness | ⏳ In Progress |
| **26**| Cloud Deployment (Vercel/Render) | ⏳ Up Next |

---

*Thank you for exploring the Smart Campus Bus Tracking System! Drive safe and never miss your bus again.* 🚌💨
