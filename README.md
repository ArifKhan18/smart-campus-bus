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
├── README.md                   # Project documentation
├── Agent.md                    # Detailed developer logic & architectural roadmap
│
├── frontend/                   # Client-Side Application
│   ├── index.html              # Landing Page
│   ├── package.json            # Node.js dependencies (Playwright for testing)
│   ├── playwright.config.ts    # E2E test configuration
│   ├── css/                    # Stylesheets
│   ├── js/                     # Core Logic (App, API, Auth, Maps)
│   │   ├── api.js, auth.js, auth-guard.js, firebase-config.js
│   │   ├── student-dashboard.js, driver-dashboard.js, admin-dashboard.js
│   │   ├── bus-management.js, route-management.js, schedule-management.js
│   │   └── analytics.js, report-management.js, announcement-management.js
│   ├── pages/                  # HTML Pages (Login, Dashboards, Role Select, OTP)
│   └── tests/                  # Playwright E2E test scripts
│
└── backend/                    # Server-Side Application (ASP.NET Core)
    ├── SmartCampusBus.Api/     # Main API Project
    │   ├── Program.cs          # Application Entry Point & DI Config
    │   ├── Dockerfile          # Docker container configuration
    │   ├── appsettings.json    # Environment & DB configurations
    │   ├── Controllers/        # API Endpoints (Auth, Bus, Route, etc.)
    │   ├── Models/             # Data structures and DTOs
    │   ├── Services/           # Business Logic (EmailService, AuthService, etc.)
    │   └── Config/             # Setup files (FirebaseSetup.cs)
    └── SmartCampusBus.Tests/   # Backend Unit and Integration tests
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
