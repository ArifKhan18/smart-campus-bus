# 🚌 Smart Campus Bus Tracking System

Welcome to the **Smart Campus Bus Tracking System**! 🎓

This project is a complete, easy-to-use web application built specifically for university students, drivers, and administrators. Our main goal is to eliminate the guesswork of "Where is the bus?" by providing **Live GPS Tracking**, real-time schedule updates, and instant notifications. 

Whether you are a student waiting for a bus, a driver managing a trip, or an admin overseeing the whole system, this application gives you a dedicated dashboard with everything you need.

---

## 🛠️ Technology Stack (What We Used)
This project is built using modern, fast, and reliable technologies:

- **Frontend (What the user sees):**
  - **HTML5**: The standard building blocks of the web pages.
  - **CSS3 (Vanilla)**: For beautiful, responsive, and modern styling (no heavy CSS frameworks used, ensuring fast load times).
  - **JavaScript (ES6+)**: The logic that makes the website interactive.
  - **Leaflet.js**: A lightweight library used for rendering interactive maps.
  - **OpenStreetMap**: The free map data provider used to show the live map.

- **Backend & Database (Where data is stored securely):**
  - **Firebase Authentication**: Manages user logins, signups, and email verification securely.
  - **Firebase Firestore**: A fast, real-time NoSQL database from Google used to store bus locations, schedules, routes, and chat messages instantly.

---

## 👥 User Roles (Who can do what)

1. **👨‍🎓 Student**:
   - Can view the live GPS location of running buses on an interactive map.
   - Can see the ETA (Estimated Time of Arrival) and distance to their location.
   - Can view all available routes, bus stops, and schedules.
   - Can participate in live group chats for specific buses.
   - Can receive real-time notifications for delays or emergencies.

2. **🚌 Driver**:
   - Needs Admin approval to activate their account.
   - Can start and stop trips with a single click.
   - Broadcasts their live GPS location to the server automatically while driving.
   - Can send delay alerts or emergency notifications to all students on their route.
   - Multi-language support (English and Bengali) for easier usability.

3. **👨‍💼 Admin**:
   - The master controller of the system.
   - Can add, edit, or delete Buses, Routes, and Schedules.
   - Can approve or reject Driver account registrations.
   - Can post Campus Announcements.
   - Has a complete overview of the system's statistics.

---

## 📂 Folder Structure
Here is how the project files are organized. *Each file has a specific purpose:*

```text
smart-campus-bus/
├── README.md                   # The file you are reading right now! Explains the project.
│
├── frontend/                   # All the code for the website's interface
│   ├── index.html              # The main Landing Page (Homepage)
│   │
│   ├── css/                    # Contains all the design and styling files
│   │   ├── index.css           # Styling specifically for the landing page
│   │   └── style.css           # Core styling for all the dashboards and inner pages
│   │
│   ├── js/                     # The JavaScript files that make the website work
│   │   ├── api.js              # Configurations for any external API connections
│   │   ├── app.js              # Interactivity for the landing page (animations, scrolling)
│   │   ├── auth.js             # Handles User Login, Registration, and Password Reset
│   │   ├── auth-guard.js       # Security logic (prevents students from accessing admin pages)
│   │   ├── firebase-config.js  # Connects our website to the Google Firebase Database
│   │   ├── driver-dashboard.js # All the logic for the Driver's panel (GPS tracking, trip setup)
│   │   ├── student-dashboard.js# All the logic for the Student's panel (Live maps, ETA, Chat)
│   │   └── temp_check.js       # Admin panel logic (managing buses, routes, schedules)
│   │
│   ├── pages/                  # The different screens/pages of the application
│   │   ├── login.html          # Where users type email/password to log in
│   │   ├── register.html       # Where new users create an account
│   │   ├── role-select.html    # Where users choose if they are a Student or Driver
│   │   ├── verify-otp.html     # Email verification screen
│   │   ├── admin-dashboard.html# The secure control panel for Administrators
│   │   ├── driver-dashboard.html# The interface where drivers manage their trips
│   │   └── student-dashboard.html# The portal where students track buses
│   │
│   └── components/
│       └── toast.html          # The small popup notifications (e.g., "Login Successful")
```

---

## 🚀 How to Use / Run the Project (For Beginners)

Since this project uses Firebase for its backend, you **do not** need to install complex server software on your computer. It runs directly in your browser!

### Step 1: Clone or Download the Project
1. Download this project as a ZIP file and extract it, OR
2. If you know Git, run this in your terminal: `git clone https://github.com/ArifKhan18/smart-campus-bus.git`

### Step 2: Open the Project
1. Open the `smart-campus-bus/frontend` folder.
2. Find the `index.html` file.
3. Simply **double-click** `index.html` to open it in Google Chrome, Firefox, or Microsoft Edge.
*(Optional but recommended: If you use VS Code, install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server" for the best experience).*

### Step 3: Test it out!
- Click **Login** from the top menu.
- If you don't have an account, click **Sign Up** and create a Student or Driver account.
- Note: New Driver accounts will see an "Awaiting Approval" screen until an Admin approves them from the Admin Dashboard.

---

## 🤝 How to Contribute (For Developers)

We welcome contributions! If you want to fix a bug or add a new feature, follow these simple steps:

1. **Fork the Repository**: Click the "Fork" button at the top right of the GitHub page to copy the project to your own account.
2. **Clone your Fork**: Download your copied version to your computer.
   ```bash
   git clone https://github.com/YourUsername/smart-campus-bus.git
   ```
3. **Create a Feature Branch**: Always create a new branch for your work.
   ```bash
   git checkout -b feature/awesome-new-feature
   ```
4. **Make your Changes**: Edit the HTML, CSS, or JS files.
5. **Commit your Changes**: Save your work with a clear message.
   ```bash
   git add .
   git commit -m "Added an awesome new feature"
   ```
6. **Push to GitHub**: Send your changes back to your GitHub account.
   ```bash
   git push origin feature/awesome-new-feature
   ```
7. **Open a Pull Request**: Go to the original project repository on GitHub and click "Compare & pull request". Explain what you changed and submit it for review!

---

## 📋 Development Roadmap (What's Done & What's Next)

| Phase | Feature Name | Status |
| :---: | :--- | :---: |
| **0** | Project Foundation & Firebase Setup | ✅ Complete |
| **1** | Role Selection & UI Design | ✅ Complete |
| **2** | Secure Authentication System | ✅ Complete |
| **3** | Driver Approval System (Admin) | ✅ Complete |
| **4** | Core Dashboard Layouts | ✅ Complete |
| **5-7**| Admin: CRUD for Buses, Routes, & Schedules | ✅ Complete |
| **8** | Student Bus Search & View | ✅ Complete |
| **9-10**| Driver Trip Setup & Running Status | ✅ Complete |
| **11-13**| OpenStreetMap, Leaflet integration & Route drawing | ✅ Complete |
| **14-15**| Background GPS Collection & Real-Time Syncing | ✅ Complete |
| **16** | Live Bus Tracking on Map (Student) | ✅ Complete |
| **17-18**| Distance Calculation & Live ETA System | ✅ Complete |
| **19** | System Notifications & Alerts | ✅ Complete |
| **20** | Live Group Chat for specific Buses | ✅ Complete |
| **21** | Polish, Bug Fixes & Mobile Responsiveness | ✅ Complete |
| **22** | Final Deployment to Hosting | ⏳ Up Next |

---

*Thank you for exploring the Smart Campus Bus Tracking System! Drive safe and never miss your bus again.* 🚌💨
