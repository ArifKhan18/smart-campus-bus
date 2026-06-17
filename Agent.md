# Smart Campus Bus Tracking System

## Project Overview

Smart Campus Bus Tracking System is a full-stack web application designed for university students, drivers, and administrators.

The goal is to allow students to:

- View bus schedules
- View routes
- View bus stops
- View bus status
- Track buses in real time (future phase)
- Receive ETA information (future phase)
- Communicate through bus-specific group chats (future phase)

The project will be developed incrementally and phase-by-phase.

---

# Technology Stack

## Frontend

- HTML
- CSS
- JavaScript

## Backend

- C# ASP.NET Core Web API

## Database

- Firebase Firestore

## Authentication

- Firebase Authentication

## Maps

- OpenStreetMap (OSM)
- Leaflet.js

## Reason for Map Selection

Google Maps API is not preferred because of pricing limitations.

This project will use:

- OpenStreetMap
- Leaflet.js

Advantages:

- Free
- Open Source
- Suitable for student projects
- Supports real-time tracking

---

# User Roles

## Student

Students can:

- Register
- Login
- View bus list
- View schedules
- View routes
- View bus stops
- View running status
- View live location (future)
- View ETA (future)
- Join bus-specific chats (future)

---

## Driver

Drivers can:

- Register
- Login
- Select assigned bus during registration
- Wait for admin approval
- Start trip
- End trip

Future:

- Share GPS location
- Real-time tracking

---

## Admin

Admins can:

- Approve drivers
- Reject drivers
- Manage buses
- Manage routes
- Manage schedules
- Manage users
- Manage announcements
- Monitor active buses

---

# Authentication Flow

## Application Start

User chooses role:

- Student
- Driver
- Admin

Then user can:

- Register
- Login

---

## Student Registration

Student registers.

Account becomes active.

Student can login immediately.

---

## Driver Registration

Driver registers.

Driver selects assigned bus.

Status:

Pending Approval

Admin must approve the driver.

Only approved drivers can login.

---

# Bus Information

Each bus contains:

- Bus Name
- Bus Number
- Assigned Driver
- Route
- Schedule
- Start Point
- End Point
- Bus Stops

Example:

Bus A

Route:

Campus → Highway → City Center

Schedule:

08:00 AM
12:00 PM
04:00 PM

Stops:

- Campus Gate
- Main Highway
- City Center

---

# Student Dashboard

Students can:

- View bus list
- View route
- View schedule
- View stops
- View bus status

---

## Running Status

If driver has not started trip:

```text
Bus is not running yet
```

If driver has started trip:

```text
Bus is currently running
```

Future:

- Live location
- ETA
- Distance information

---

# Driver Dashboard

Driver sees:

- Assigned Bus
- Start Button
- End Button

---

## Start Trip

When Start button is clicked:

```text
Bus Status = Running
```

---

## End Trip

When End button is clicked:

```text
Bus Status = Not Running
```

---

# Live Tracking System (Future)

## Driver Side

Driver device:

- GPS Access
- Latitude
- Longitude

Location updates every:

```text
5–10 seconds
```

Location stored in Firebase.

---

## Student Side

Students receive:

- Real-time location updates
- Moving bus marker

Map:

- OpenStreetMap
- Leaflet

---

# ETA System (Future)

ETA should be based on:

- Route
- Bus Stops
- Bus Position

Not based on:

```text
Student home location
```

Reason:

Students may check buses from anywhere.

ETA should be calculated according to the route.

---

# Group Chat System (Future)

Each bus has its own chat room.

Example:

- Bus A Chat
- Bus B Chat
- Bus C Chat

Students assigned to a bus can communicate inside that chat room.

---

# Database Collections

## users

Stores all users.

Fields:

- id
- name
- email
- role
- status

---

## students

Stores student information.

---

## drivers

Stores driver information.

---

## admins

Stores admin information.

---

## buses

Stores bus information.

---

## routes

Stores route information.

---

## schedules

Stores schedule information.

---

## trips

Stores active trip information.

---

## locations

Stores live GPS updates.

---

## driverApprovals

Stores pending driver approvals.

---

## chatRooms

Stores bus chat rooms.

---

## messages

Stores chat messages.

---

# Development Roadmap

---

# Phase 0 – Project Foundation

- GitHub Repository
- Folder Structure
- README
- Frontend Setup
- Backend Setup
- Firebase Setup

---

# Phase 1 – Role Selection UI

- Landing Page
- Student Option
- Driver Option
- Admin Option

---

# Phase 2 – Authentication

- Student Register
- Student Login
- Driver Register
- Driver Login
- Admin Login

---

# Phase 3 – Driver Approval System

- Pending Drivers
- Approve Driver
- Reject Driver

---

# Phase 4 – Basic Dashboards

Student Dashboard

Driver Dashboard

Admin Dashboard

---

# Phase 5 – Bus Management

Admin:

- Add Bus
- Edit Bus
- Delete Bus

---

# Phase 6 – Route Management

Admin:

- Add Route
- Edit Route
- Delete Route

---

# Phase 7 – Schedule Management

Admin:

- Add Schedule
- Edit Schedule
- Delete Schedule

---

# Phase 8 – Student Bus View

Student:

- View Bus List
- View Schedule
- View Route
- View Stops

---

# Phase 9 – Driver Trip System

Driver:

- Start Trip
- End Trip

---

# Phase 10 – Running Status System

Student sees:

- Running
- Not Running

---

# Phase 11 – OpenStreetMap Integration

Integrate:

- OpenStreetMap
- Leaflet.js

---

# Phase 12 – Bus Stop Visualization

Display:

- Start Point
- End Point
- Stops

---

# Phase 13 – Route Visualization

Display route on map.

---

# Phase 14 – GPS Collection

Driver device:

- GPS Access
- Location Collection

---

# Phase 15 – Real-Time Tracking Backend

Store:

- Latitude
- Longitude
- Timestamp

Firebase updates.

---

# Phase 16 – Live Tracking

Students view:

- Moving Bus Marker

---

# Phase 17 – Distance Calculation

Calculate:

- Bus to Stop Distance

---

# Phase 18 – ETA System

Display:

- ETA
- Next Stop
- Remaining Distance

---

# Phase 19 – Notifications

Students receive:

- Bus Started
- Bus Delayed
- Bus Arrived

---

# Phase 20 – Group Chat

Bus-specific chat rooms.

---

# Phase 21 – Announcements

Admin:

- Notices
- Alerts
- Schedule Changes

---

# Phase 22 – Attendance (Optional)

Future:

- QR Attendance
- Boarding Records

---

# Phase 23 – Analytics Dashboard

Admin:

- Active Buses
- Active Drivers
- Daily Trips
- Usage Statistics

---

# Phase 24 – Security

- Role Authorization
- API Protection
- Validation

---

# Phase 25 – Testing

- Unit Testing
- Integration Testing
- UI Testing

---

# Phase 26 – Deployment

Frontend:

- Vercel / Netlify

Backend:

- Render / Railway

Database:

- Firebase

---

# Phase 27 – Production Release

- Documentation
- Optimization
- Bug Fixes

---

# Development Rule

IMPORTANT:

- Never build the entire project at once.
- Complete one phase at a time.
- Wait for approval before moving to the next phase.
- Keep architecture scalable.
- Use clean code principles.
- Maintain GitHub-friendly folder structure.
- Follow production-ready development practices.