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
│   │   ├── firebase-config.js  # Firebase Web SDK config
│   │   ├── role-select.js      # Role selection page logic
│   │   └── auth.js             # Auth pages (login/register) logic
│   ├── pages/
│   │   ├── role-select.html    # Role selection page
│   │   ├── login.html          # Login page
│   │   └── register.html       # Registration page
│   └── assets/
│       └── images/             # Image assets
│
└── backend/
    └── SmartCampusBus.Api/     # ASP.NET Core Web API
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
| 3     | Driver Approval System  | ⏳ Pending  |
| 4     | Basic Dashboards        | ⏳ Pending  |
| 5     | Bus Management          | ⏳ Pending  |
| 6     | Route Management        | ⏳ Pending  |
| 7     | Schedule Management     | ⏳ Pending  |
| 8     | Student Bus View        | ⏳ Pending  |
| 9     | Driver Trip System      | ⏳ Pending  |
| 10    | Running Status System   | ⏳ Pending  |
| 11    | OpenStreetMap Integration | ⏳ Pending |
| 12    | Bus Stop Visualization  | ⏳ Pending  |
| 13    | Route Visualization     | ⏳ Pending  |
| 14-18 | GPS, Tracking, ETA      | ⏳ Future   |
| 19-20 | Notifications, Chat     | ⏳ Future   |
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
