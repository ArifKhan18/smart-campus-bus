# 🚌 Smart Campus Bus Tracking System

A full-stack web application for university campus bus tracking. Students can view bus schedules, routes, stops, and running status. Drivers can manage trips. Admins can manage the entire system.

---

## 🛠️ Technology Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | HTML, CSS, JavaScript             |
| Backend        | C# ASP.NET Core Web API (.NET 10) |
| Database       | Firebase Firestore                |
| Authentication | Firebase Authentication           |
| Maps           | OpenStreetMap + Leaflet.js        |

---

## 📁 Folder Structure

```
smart-campus-bus/
├── Agent.md                    # Project specification document
├── README.md                   # This file
├── .gitignore                  # Git ignore rules
│
├── frontend/                   # Frontend (HTML/CSS/JS)
│   ├── index.html              # Main landing page
│   ├── css/
│   │   └── style.css           # Core design system
│   ├── js/
│   │   ├── app.js              # Main JavaScript (landing page)
│   │   ├── auth.js             # Auth pages (login/register) logic
│   │   ├── auth-guard.js       # Route protection logic
│   │   ├── firebase-config.js  # Firebase Web SDK config
│   │   ├── role-select.js      # Role selection page logic
│   │   ├── admin-dashboard.js  # Admin panel logic
│   │   ├── bus-management.js   # Admin: Bus CRUD operations
│   │   ├── route-management.js # Admin: Route CRUD operations
│   │   ├── schedule-management.js # Admin: Schedule CRUD
│   │   ├── driver-dashboard.js # Driver panel and trip system
│   │   └── student-dashboard.js # Student tracking panel
│   ├── pages/
│   │   ├── role-select.html    # Role selection page
│   │   ├── login.html          # Login page
│   │   ├── register.html       # Registration page
│   │   ├── admin-dashboard.html # Admin panel
│   │   ├── driver-dashboard.html # Driver panel
│   │   └── student-dashboard.html # Student portal
│   └── assets/
│       └── images/             # Image assets
│
└── backend/
    └── SmartCampusBus.Api/     # ASP.NET Core Web API (Future)
        ├── Controllers/        # API Controllers
        ├── Models/             # Data Models
        ├── Services/           # Business Logic
        └── Config/             # Configuration helpers
```

---

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- Modern web browser (Chrome, Firefox, Edge)
- [Git](https://git-scm.com/)
- Firebase account (for database and authentication)

### Run the Backend

```bash
cd backend/SmartCampusBus.Api
dotnet run
```

The API will start at `http://localhost:5000`.

### Run the Frontend

Open `frontend/index.html` in your browser directly, or use a live server extension:

- **VS Code**: Install "Live Server" extension → Right-click `index.html` → "Open with Live Server"
- **Manual**: Just double-click `frontend/index.html`

---

## 👥 User Roles

| Role    | Capabilities                                           |
|---------|--------------------------------------------------------|
| Student | View buses, schedules, routes, stops, running status   |
| Driver  | Start/end trips, manage assigned bus                   |
| Admin   | Manage buses, routes, schedules, approve drivers       |

---

## 📋 Development Roadmap

| Phase | Name                    | Status      |
|-------|-------------------------|-------------|
| 0     | Project Foundation      | ✅ Complete |
| 1     | Role Selection UI       | ✅ Complete |
| 2     | Authentication          | ✅ Complete |
| 3     | Driver Approval System  | ✅ Complete |
| 4     | Basic Dashboards        | ✅ Complete |
| 5     | Bus Management          | ✅ Complete |
| 6     | Route Management        | ✅ Complete |
| 7     | Schedule Management     | ✅ Complete |
| 8     | Student Bus View        | ✅ Complete |
| 9     | Driver Trip System      | ✅ Complete |
| 10    | Running Status System   | ✅ Complete |
| 11    | OpenStreetMap Integration | ✅ Complete |
| 12    | Bus Stop Visualization  | ✅ Complete |
| 13    | Route Visualization     | ✅ Complete |
| 14    | GPS Collection (Driver) | ✅ Complete |
| 15    | Real-Time Tracking Backend | ✅ Complete |
| 16    | Live Tracking (Student) | ✅ Complete |
| 17    | Distance Calculation    | ✅ Complete |
| 18    | ETA System              | ✅ Complete |
| 19    | Notifications           | ✅ Complete |
| 20    | Group Chat              | ✅ Complete |
| 21-27 | Polish & Deployment     | ⏳ Future   |
---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes.
