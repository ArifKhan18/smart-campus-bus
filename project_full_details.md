# 🚌 Smart Campus Bus — Full Project Details (সম্পূর্ণ প্রজেক্ট গাইড)

এই ডকুমেন্টে প্রজেক্টের প্রতিটি ফাইল, প্রতিটি ফাংশন কল, কোন ফাইল থেকে কোন ফাইলে ডেটা যাচ্ছে — সবকিছু বিস্তারিতভাবে লেখা আছে।

---

## 📌 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট ওভারভিউ](#-প্রজেক্ট-ওভারভিউ)
2. [টেকনোলজি স্ট্যাক](#-টেকনোলজি-স্ট্যাক)
3. [ফোল্ডার স্ট্রাকচার](#-ফোল্ডার-স্ট্রাকচার)
4. [Backend বিস্তারিত (C# ASP.NET Core)](#-backend-বিস্তারিত)
5. [Frontend বিস্তারিত (HTML/CSS/JS)](#-frontend-বিস্তারিত)
6. [সম্পূর্ণ ওয়ার্কফ্লো (A to Z)](#-সম্পূর্ণ-ওয়ার্কফ্লো)
7. [API এন্ডপয়েন্ট তালিকা](#-api-এন্ডপয়েন্ট-তালিকা)

---

## 🎯 প্রজেক্ট ওভারভিউ

**Smart Campus Bus Tracking System** হলো ইউনিভার্সিটি ক্যাম্পাসের বাস ট্র্যাকিং সিস্টেম। এখানে ৩ ধরনের ইউজার আছে:

| Role | কাজ |
|------|------|
| **Student** | লাইভ ম্যাপে বাস দেখা, ETA জানা, চ্যাট করা, নোটিফিকেশন পাওয়া |
| **Driver** | ট্রিপ শুরু/বন্ধ করা, GPS ব্রডকাস্ট করা, দেরি হলে নোটিশ দেওয়া |
| **Admin** | বাস/রুট/শিডিউল ম্যানেজ করা, ড্রাইভার অ্যাপ্রুভ করা, নোটিশ দেওয়া |

---

## 🛠 টেকনোলজি স্ট্যাক

| অংশ | টেকনোলজি | কেন ব্যবহার করা হয়েছে |
|------|-----------|----------------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) | ইউজার ইন্টারফেস তৈরি করা |
| Map | Leaflet.js + OpenStreetMap | ম্যাপে বাসের লোকেশন পিন করা |
| Backend API | C# ASP.NET Core Web API | সিকিউর ডেটা প্রসেসিং |
| Database | Firebase Firestore (NoSQL) | রিয়েল-টাইম ডেটা সিঙ্ক |
| Auth | Firebase Authentication | লগইন/সাইন আপ সিস্টেম |
| Email | Brevo API | OTP ভেরিফিকেশন ইমেইল পাঠানো |
| Testing | Playwright (E2E), xUnit (Unit) | অটোমেটেড টেস্টিং |
| Deployment | Docker, Render | ক্লাউডে হোস্টিং |

---

## 📂 ফোল্ডার স্ট্রাকচার

```
smart-campus-bus/
├── backend/
│   ├── SmartCampusBus.Api/
│   │   ├── Config/
│   │   │   └── FirebaseConfig.cs        ← Firebase SDK ইনিশিয়ালাইজ
│   │   ├── Models/
│   │   │   ├── User.cs                  ← ইউজার ডেটা মডেল
│   │   │   ├── Bus.cs                   ← বাস ডেটা মডেল
│   │   │   ├── Route.cs                 ← রুট ডেটা মডেল
│   │   │   ├── RouteStop.cs             ← রুটের স্টপেজ মডেল
│   │   │   ├── Schedule.cs              ← সময়সূচি মডেল
│   │   │   └── Announcement.cs          ← নোটিশ মডেল
│   │   ├── Services/
│   │   │   ├── AuthService.cs           ← ইউজার ম্যানেজমেন্ট লজিক
│   │   │   ├── BusService.cs            ← বাস CRUD লজিক
│   │   │   ├── RouteService.cs          ← রুট CRUD লজিক
│   │   │   ├── ScheduleService.cs       ← শিডিউল CRUD লজিক
│   │   │   ├── AnnouncementService.cs   ← নোটিশ CRUD লজিক
│   │   │   └── EmailService.cs          ← OTP ইমেইল পাঠানোর লজিক
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs        ← ইউজার API endpoints
│   │   │   ├── BusController.cs         ← বাস API endpoints
│   │   │   ├── RouteController.cs       ← রুট API endpoints
│   │   │   ├── ScheduleController.cs    ← শিডিউল API endpoints
│   │   │   └── AnnouncementController.cs ← নোটিশ API endpoints
│   │   ├── Program.cs                   ← সার্ভার এন্ট্রি পয়েন্ট
│   │   ├── appsettings.json             ← কনফিগারেশন (API keys)
│   │   └── Dockerfile                   ← Docker কনটেইনার বানানো
│   └── SmartCampusBus.Tests/            ← ইউনিট টেস্ট
│
└── frontend/
    ├── index.html                       ← ল্যান্ডিং পেজ (হোমপেজ)
    ├── css/style.css                    ← পুরো অ্যাপের CSS ডিজাইন
    ├── pages/
    │   ├── role-select.html             ← রোল সিলেক্ট স্ক্রিন
    │   ├── login.html                   ← লগইন পেজ
    │   ├── register.html                ← রেজিস্ট্রেশন পেজ
    │   ├── verify-otp.html              ← OTP ভেরিফিকেশন পেজ
    │   ├── dashboard.html               ← ড্যাশবোর্ড রাউটার
    │   ├── student-dashboard.html       ← স্টুডেন্ট ড্যাশবোর্ড
    │   ├── driver-dashboard.html        ← ড্রাইভার ড্যাশবোর্ড
    │   └── admin-dashboard.html         ← অ্যাডমিন ড্যাশবোর্ড
    └── js/
        ├── firebase-config.js           ← Firebase সংযোগ সেটআপ
        ├── api.js                       ← Backend API কল করার ব্রিজ
        ├── auth.js                      ← লগইন/রেজিস্টার ফর্ম লজিক
        ├── auth-guard.js                ← পেজ প্রোটেকশন (গার্ড)
        ├── role-select.js               ← রোল সিলেকশন অ্যানিমেশন
        ├── app.js                       ← ল্যান্ডিং পেজ লজিক
        ├── student-dashboard.js         ← স্টুডেন্ট ড্যাশবোর্ড লজিক
        ├── driver-dashboard.js          ← ড্রাইভার ড্যাশবোর্ড লজিক
        ├── admin-dashboard.js           ← অ্যাডমিন ড্যাশবোর্ড লজিক
        ├── bus-management.js            ← বাস ম্যানেজমেন্ট UI (Admin)
        ├── route-management.js          ← রুট ম্যানেজমেন্ট UI (Admin)
        ├── schedule-management.js       ← শিডিউল ম্যানেজমেন্ট UI (Admin)
        ├── announcement-management.js   ← নোটিশ ম্যানেজমেন্ট UI (Admin)
        ├── user-management.js           ← ইউজার ম্যানেজমেন্ট UI (Admin)
        ├── analytics.js                 ← অ্যাডমিন চার্ট/গ্রাফ
        ├── report-management.js         ← রিপোর্ট তৈরি (Admin)
        ├── dashboard.js                 ← ড্যাশবোর্ড রাউটিং লজিক
        └── theme.js                     ← ডার্ক/লাইট মোড টগল
```

---

## 🟢 BACKEND বিস্তারিত

### ⚙️ Program.cs — সার্ভারের এন্ট্রি পয়েন্ট
**ফাইল:** `backend/SmartCampusBus.Api/Program.cs`

এটি সার্ভারের "মেইন গেট"। `dotnet run` কমান্ড দিলে সবচেয়ে আগে এই ফাইলটি রান হয়। এটি যা করে:

1. **CORS সেটআপ:** ফ্রন্টএন্ডকে ব্যাকএন্ডে রিকোয়েস্ট পাঠানোর অনুমতি দেয়।
2. **Firebase ইনিশিয়ালাইজ:** `FirebaseSetup.Initialize()` কল করে Firebase Admin SDK চালু করে।
3. **Firestore রেজিস্টার:** ডেটাবেসের সাথে সংযোগ তৈরি করে (`FirestoreDb.Create(projectId)`)।
4. **সব সার্ভিস রেজিস্টার করে:**
   - `AuthService` → ইউজার ম্যানেজমেন্ট
   - `BusService` → বাস ম্যানেজমেন্ট
   - `RouteService` → রুট ম্যানেজমেন্ট
   - `ScheduleService` → শিডিউল ম্যানেজমেন্ট
   - `AnnouncementService` → নোটিশ ম্যানেজমেন্ট
   - `EmailService` → ইমেইল পাঠানো
5. **JWT Authentication সেটআপ:** Firebase Token ভেরিফাই করার জন্য।
6. **Role-based Authorization:** টোকেন থেকে ইউজারের রোল (student/driver/admin) বের করে পারমিশন চেক করে।

**কল চেইন:**
```
dotnet run → Program.cs → FirebaseSetup.Initialize() → Firestore সংযোগ → সব Service রেজিস্টার → সার্ভার রান
```

---

### 🔧 FirebaseConfig.cs — Firebase SDK ইনিশিয়ালাইজেশন
**ফাইল:** `backend/SmartCampusBus.Api/Config/FirebaseConfig.cs`

এটি Firebase Admin SDK চালু করে। `serviceAccountKey.json` ফাইল থেকে Firebase এর credential পড়ে। এটি `Program.cs` থেকে কল হয়।

**কল চেইন:**
```
Program.cs → FirebaseSetup.Initialize(configuration) → serviceAccountKey.json পড়ে → Firebase চালু
```

---

### 📦 MODELS (ডেটা মডেল)

#### User.cs
ডেটাবেসে ইউজারের ডেটা কীভাবে সেভ হবে:
| ফিল্ড | টাইপ | কাজ |
|--------|------|------|
| `Uid` | string | ইউজারের ইউনিক আইডি (Firebase থেকে পাওয়া) |
| `Name` | string | ইউজারের আসল নাম |
| `Email` | string | ইমেইল অ্যাড্রেস |
| `Role` | string | "student" / "driver" / "admin" |
| `Status` | string | "active" / "pending" / "rejected" |
| `AssignedBus` | string? | ড্রাইভারকে কোন বাস দেওয়া হয়েছে (nullable) |
| `CreatedAt` | DateTime | একাউন্ট তৈরির সময় |

#### Bus.cs
| ফিল্ড | টাইপ | কাজ |
|--------|------|------|
| `BusId` | string | বাসের ইউনিক আইডি |
| `BusName` | string | বাসের নাম (যেমন: "Surma") |
| `BusNumber` | string | লাইসেন্স প্লেট নম্বর |
| `Capacity` | int? | সিট সংখ্যা (ঐচ্ছিক) |
| `AssignedDriver` | string? | ড্রাইভারের UID |
| `AssignedDriverName` | string? | ড্রাইভারের নাম |
| `Route` | string? | রুটের নাম |
| `Status` | string | "active" / "inactive" / "running" / "maintenance" |
| `CreatedAt` | DateTime | কখন অ্যাড করা হয়েছে |
| `UpdatedAt` | DateTime | শেষ আপডেটের সময় |

#### Route.cs
| ফিল্ড | টাইপ | কাজ |
|--------|------|------|
| `RouteId` | string | রুটের ইউনিক আইডি |
| `RouteName` | string | রুটের নাম |
| `StartPoint` | string | শুরুর স্থান |
| `EndPoint` | string | গন্তব্য |
| `Stops` | List\<RouteStop\> | মধ্যবর্তী স্টপেজগুলোর লিস্ট |
| `AssignedBus` | string? | এই রুটে কোন বাস চলে |

#### RouteStop.cs
| ফিল্ড | টাইপ | কাজ |
|--------|------|------|
| `Name` | string | স্টপেজের নাম (যেমন: "Mirpur 10") |
| `Order` | int | স্টপেজের সিরিয়াল নম্বর |
| `Latitude` | double? | GPS অক্ষাংশ |
| `Longitude` | double? | GPS দ্রাঘিমাংশ |

#### Schedule.cs
| ফিল্ড | টাইপ | কাজ |
|--------|------|------|
| `ScheduleId` | string | শিডিউলের আইডি |
| `BusId` | string | কোন বাসের শিডিউল |
| `BusName` | string | বাসের নাম |
| `DepartureTime` | string | ছাড়ার সময় ("08:30") |
| `OperatingDays` | List\<string\> | কোন কোন দিন চলবে |

#### Announcement.cs
| ফিল্ড | টাইপ | কাজ |
|--------|------|------|
| `Id` | string | নোটিশের আইডি |
| `Title` | string | শিরোনাম |
| `Message` | string | বিস্তারিত বার্তা |
| `Type` | string | "info" / "alert" / "emergency" |
| `Priority` | string | "high" / "medium" / "low" |
| `TargetAudience` | string | "all" / "student" / "driver" |
| `Status` | string | "published" / "draft" |

---

### 🧠 SERVICES (বিজনেস লজিক)

#### EmailService.cs — OTP ইমেইল পাঠানো
**কে কল করে:** `AuthController.cs` এর `SendOtp()` মেথড
**কী করে:** Brevo API ব্যবহার করে ইউজারের ইমেইলে একটি সুন্দর HTML ইমেইল পাঠায় যেখানে ৬-ডিজিটের OTP কোড থাকে।

**কল চেইন:**
```
Frontend (auth.js / verify-otp পেজ) 
  → api.js (fetchWithAuth) 
    → POST /api/auth/send-otp 
      → AuthController.SendOtp() 
        → AuthService.SaveOtpAsync() [ডেটাবেসে OTP সেভ]
        → EmailService.SendOtpEmailAsync() [ইমেইল পাঠানো]
          → Brevo API (https://api.brevo.com/v3/smtp/email) [ইমেইল ডেলিভারি]
```

#### AuthService.cs — ইউজার ম্যানেজমেন্ট
**কে কল করে:** `AuthController.cs`
**মূল ফাংশনগুলো:**

| ফাংশন | কাজ | কে কল করে |
|--------|------|-----------|
| `GetUserAsync(uid)` | UID দিয়ে ইউজারের প্রোফাইল আনা | AuthController.GetMe(), GetUser() |
| `UpdateUserStatusAsync(uid, status)` | ড্রাইভার Approve/Reject করা | AuthController.UpdateUserStatus() |
| `GetUsersByRoleAsync(role)` | নির্দিষ্ট রোলের সব ইউজার আনা | AuthController.GetUsersByRole() |
| `SaveOtpAsync(uid, otpCode, expiresAt)` | OTP কোড ডেটাবেসে সেভ | AuthController.SendOtp() |
| `VerifyOtpAsync(uid, otpCode)` | OTP মেলানো ও একাউন্ট ভেরিফাই | AuthController.VerifyOtp() |
| `UpdateProfileAsync(uid, name)` | নাম পরিবর্তন করা | AuthController.UpdateProfile() |
| `DeleteUserAccountAsync(uid)` | একাউন্ট ডিলিট করা | AuthController.DeleteAccount() |

#### BusService.cs — বাস CRUD
**কে কল করে:** `BusController.cs`
**মূল ফাংশনগুলো:**

| ফাংশন | কাজ |
|--------|------|
| `GetAllBusesAsync()` | সব বাসের লিস্ট আনা |
| `GetBusByIdAsync(busId)` | নির্দিষ্ট বাসের ডিটেইলস |
| `CreateBusAsync(bus)` | নতুন বাস তৈরি করা |
| `UpdateBusAsync(busId, bus)` | বাসের ইনফো আপডেট করা |
| `DeleteBusAsync(busId)` | বাস ডিলিট করা |
| `MapToBus(document)` | Firestore ডেটাকে C# অবজেক্টে কনভার্ট |
| `MapToDictionary(bus)` | C# অবজেক্টকে Firestore ডেটায় কনভার্ট |

**কল চেইন (উদাহরণ — নতুন বাস তৈরি):**
```
Admin Dashboard (bus-management.js)
  → ApiService.fetchWithAuth('/Bus', { method: 'POST', body: busData })
    → api.js (টোকেন নিয়ে রিকোয়েস্ট পাঠায়)
      → POST /api/bus
        → BusController.CreateBus(request)
          → BusService.CreateBusAsync(bus)
            → Firebase Firestore (buses কালেকশনে সেভ)
```

#### RouteService.cs, ScheduleService.cs, AnnouncementService.cs
এগুলো `BusService` এর মতোই CRUD অপারেশন করে, শুধু ভিন্ন ডেটার জন্য।

---

### 🌐 CONTROLLERS (API Endpoints)

#### AuthController.cs — `/api/auth/...`
| HTTP Method | Endpoint | কাজ | অনুমতি |
|-------------|----------|------|--------|
| GET | `/api/auth/me` | নিজের প্রোফাইল দেখা | যেকোনো লগইন ইউজার |
| GET | `/api/auth/user/{uid}` | নির্দিষ্ট ইউজারের প্রোফাইল | শুধু Admin |
| GET | `/api/auth/users/role/{role}` | রোল অনুযায়ী ইউজার লিস্ট | শুধু Admin |
| PUT | `/api/auth/user/{uid}/status` | ড্রাইভার Approve/Reject | শুধু Admin |
| POST | `/api/auth/send-otp` | ইমেইলে OTP পাঠানো | যেকোনো লগইন ইউজার |
| POST | `/api/auth/verify-otp` | OTP যাচাই করা | যেকোনো লগইন ইউজার |
| PUT | `/api/auth/profile` | নাম পরিবর্তন | যেকোনো লগইন ইউজার |
| DELETE | `/api/auth/account` | একাউন্ট ডিলিট | যেকোনো লগইন ইউজার |

#### BusController.cs — `/api/bus/...`
| HTTP Method | Endpoint | কাজ | অনুমতি |
|-------------|----------|------|--------|
| GET | `/api/bus` | সব বাসের লিস্ট | শুধু Admin |
| GET | `/api/bus/{id}` | একটি বাসের ডিটেইলস | শুধু Admin |
| POST | `/api/bus` | নতুন বাস তৈরি | শুধু Admin |
| PUT | `/api/bus/{id}` | বাস আপডেট | শুধু Admin |
| DELETE | `/api/bus/{id}` | বাস ডিলিট | শুধু Admin |

#### RouteController.cs — `/api/route/...`
| HTTP Method | Endpoint | কাজ | অনুমতি |
|-------------|----------|------|--------|
| GET | `/api/route` | সব রুট | শুধু Admin |
| GET | `/api/route/{id}` | একটি রুট | শুধু Admin |
| POST | `/api/route` | নতুন রুট | শুধু Admin |
| PUT | `/api/route/{id}` | রুট আপডেট | শুধু Admin |
| DELETE | `/api/route/{id}` | রুট ডিলিট | শুধু Admin |

#### ScheduleController.cs — `/api/schedule/...`
| HTTP Method | Endpoint | কাজ | অনুমতি |
|-------------|----------|------|--------|
| GET | `/api/schedule` | সব শিডিউল | শুধু Admin |
| POST | `/api/schedule` | নতুন শিডিউল | শুধু Admin |
| PUT | `/api/schedule/{id}` | শিডিউল আপডেট | শুধু Admin |
| DELETE | `/api/schedule/{id}` | শিডিউল ডিলিট | শুধু Admin |

#### AnnouncementController.cs — `/api/announcement/...`
| HTTP Method | Endpoint | কাজ | অনুমতি |
|-------------|----------|------|--------|
| POST | `/api/announcement` | নোটিশ তৈরি | শুধু Admin |
| PUT | `/api/announcement/{id}` | নোটিশ আপডেট | শুধু Admin |
| DELETE | `/api/announcement/{id}` | নোটিশ ডিলিট | শুধু Admin |

---

## 🔵 FRONTEND বিস্তারিত

### 🔥 firebase-config.js — Firebase সংযোগ
**কাজ:** পুরো ফ্রন্টএন্ডে Firebase ব্যবহারের জন্য প্রথমে এটি Firebase চালু (initialize) করে। এটি ৩টি জিনিস export করে:
- `app` → Firebase অ্যাপ ইনস্ট্যান্স
- `auth` → লগইন/সাইন আপ সিস্টেম
- `db` → Firestore ডেটাবেস সংযোগ

**কে ইম্পোর্ট করে:**
```
auth.js          → import { auth, db } from "./firebase-config.js"
auth-guard.js    → import { app, auth, db } from "./firebase-config.js"
student-dashboard.js → import { db } from "./firebase-config.js"
driver-dashboard.js  → import { db } from "./firebase-config.js"
admin-dashboard.js   → import { auth, db } from "./firebase-config.js"
app.js           → import { app, auth, db } from "./firebase-config.js"
```

---

### 🔗 api.js — Backend এর সাথে সেতু (Bridge)
**কাজ:** ফ্রন্টএন্ড থেকে C# ব্যাকএন্ডে API কল পাঠানোর একমাত্র রাস্তা।

**গুরুত্বপূর্ণ ফাংশনগুলো:**

| ফাংশন | কাজ |
|--------|------|
| `getToken()` | Firebase থেকে ইউজারের সিক্রেট JWT Token সংগ্রহ করে |
| `fetchWithAuth(endpoint, options)` | টোকেনসহ ব্যাকএন্ডে রিকোয়েস্ট পাঠায় |

**API_BASE_URL নির্ধারণ:**
- লোকাল: `http://localhost:5196/api`
- লাইভ: `https://smart-campus-bus-api.onrender.com/api`

**কে ইম্পোর্ট করে:**
```
auth.js              → import { API_BASE_URL } from "./api.js"
admin-dashboard.js   → import { ApiService } from "./api.js"
bus-management.js    → import { ApiService } from "./api.js"
route-management.js  → import { ApiService } from "./api.js"
schedule-management.js → import { ApiService } from "./api.js"
announcement-management.js → import { ApiService } from "./api.js"
user-management.js   → import { ApiService } from "./api.js"
student-dashboard.js → import { API_BASE_URL } from "./api.js"
```

---

### 🛡️ auth-guard.js — পেজ প্রোটেকশন (Security Guard)
**কাজ:** প্রতিটি ড্যাশবোর্ড পেজ লোড হওয়ার সময় এই ফাইলটি চেক করে:
1. ইউজার কি লগইন করা আছে? না হলে → `role-select.html` এ redirect
2. ইউজারের রোল কি ঠিক আছে? (যেমন: স্টুডেন্ট কি অ্যাডমিন পেজে ঢোকার চেষ্টা করছে?) ভুল হলে → হোমে redirect
3. ড্রাইভারের একাউন্ট কি approved? না হলে → লগইনে redirect
4. ইউজার কি blocked? হলে → লগআউট করে দেয়

**মূল ফাংশন:** `initAuthGuard(requireAuth, allowedRoles)`

**কে কল করে:**
```
student-dashboard.js → initAuthGuard(true, ['student'])
driver-dashboard.js  → initAuthGuard(true, ['driver'])
app.js               → initAuthGuard(false) [শুধু চেক, redirect না]
```

---

### 🎭 role-select.js — রোল সিলেকশন পেজ
**কাজ:** `role-select.html` পেজে যখন তিনটি কার্ড (Student, Driver, Admin) আসে, তখন কার্ডগুলো সুন্দরভাবে নিচ থেকে উপরে আসার অ্যানিমেশন দেখায়।

---

### 🔐 auth.js — লগইন ও রেজিস্ট্রেশন লজিক
**কাজ:** `login.html` এবং `register.html` পেজের পেছনে কাজ করে।

**লগইন ফ্লো (handleLoginSubmit):**
```
1. ইউজার ইমেইল ও পাসওয়ার্ড দেয়
2. auth.js → Firebase Auth (signInWithEmailAndPassword) কল করে
3. Firebase Auth ইউজারকে যাচাই করে Token দেয়
4. auth.js → Firestore থেকে ইউজারের প্রোফাইল (role, status) পড়ে
5. চেক করে:
   - রোল মিলছে কিনা (student পেজ থেকে লগইন করলে role student হতে হবে)
   - ইমেইল ভেরিফাই করা আছে কিনা (না হলে verify-otp.html এ পাঠায়)
   - ড্রাইভার হলে, status "active" কিনা (pending হলে ঢুকতে দেয় না)
6. সব ঠিক হলে → dashboard.html?role=student/driver/admin এ redirect করে
```

**রেজিস্ট্রেশন ফ্লো (handleRegisterSubmit):**
```
1. ইউজার নাম, ইমেইল, পাসওয়ার্ড দেয়
2. auth.js → Firebase Auth (createUserWithEmailAndPassword) কল করে
3. Firebase নতুন একাউন্ট তৈরি করে UID দেয়
4. auth.js → Firestore এ ইউজার প্রোফাইল সেভ করে (setDoc):
   - uid, name, email, role
   - ড্রাইভার হলে status = "pending", স্টুডেন্ট হলে "active"
5. verify-otp.html এ redirect করে
```

**অন্যান্য ফিচার:**
- পাসওয়ার্ড দেখা/লুকানোর টগল বাটন
- "Forgot Password" → Firebase এর `sendPasswordResetEmail()` কল করে
- রোল অনুযায়ী UI কালার পরিবর্তন (Student = নীল, Driver = সবুজ, Admin = লাল)

---

### 🏠 app.js — ল্যান্ডিং পেজ লজিক
**কাজ:** `index.html` (হোমপেজ) এর পেছনে কাজ করে।
- কাউন্টার অ্যানিমেশন (যেমন: "500+ Students" সংখ্যাটা গুনে গুনে বাড়ে)
- স্ক্রল করলে কার্ডগুলো ধীরে ধীরে আসে (Scroll Reveal)
- হেডার স্ক্রল করলে ব্যাকগ্রাউন্ড রঙ পরিবর্তন হয়
- ইউজার ইতিমধ্যে লগইন করা থাকলে সরাসরি তার ড্যাশবোর্ডে redirect করে দেয়

---

### 🌓 theme.js — ডার্ক/লাইট মোড
**কাজ:** 
- `localStorage` থেকে সেভ করা থিম চেক করে
- না থাকলে সিস্টেমের থিম (ডার্ক/লাইট) ফলো করে
- `toggleTheme()` ফাংশনটি বাটন ক্লিকে থিম পরিবর্তন করে
- ☀️ বা 🌙 আইকন আপডেট করে

---

### 🎓 student-dashboard.js — স্টুডেন্ট ড্যাশবোর্ড
**এটি প্রজেক্টের সবচেয়ে বড় ফাইল (~2100 লাইন)।**

**মূল ফিচার ও ফাংশন:**

#### ১. ড্যাশবোর্ড সেটআপ
```
DOMContentLoaded → initAuthGuard(true, ['student']) → auth-guard.js চেক করে
→ সব ঠিক হলে:
   → setupDashboard(user, profile) [নাম দেখানো, ইমেইল ভেরিফিকেশন ব্যানার]
   → initNavigation() [মেনু ক্লিক হ্যান্ডলিং]
   → initDataListeners() [রিয়েল-টাইম ডেটা শোনা]
   → initNotifications() [নোটিফিকেশন সিস্টেম]
   → initChat() [গ্রুপ চ্যাট]
   → initAnnouncements() [নোটিশ দেখানো]
   → initSettings() [সেটিংস]
```

#### ২. রিয়েল-টাইম ডেটা (initDataListeners)
```
initDataListeners()
  → listenToBuses()      [Firebase onSnapshot → buses কালেকশন শোনে → renderBuses()]
  → listenToRoutes()     [Firebase onSnapshot → routes কালেকশন শোনে → renderRoutes()]
  → listenToSchedules()  [Firebase onSnapshot → schedules কালেকশন শোনে → renderSchedules()]
```

**গুরুত্বপূর্ণ:** `onSnapshot` হলো Firebase এর একটি রিয়েল-টাইম লিসেনার। ডেটাবেসে কোনো পরিবর্তন হলে সাথে সাথে (পেজ রিলোড ছাড়াই) নতুন ডেটা চলে আসে।

#### ৩. বাস কার্ড ক্লিক → ম্যাপ ওপেন (openBusDetails)
```
স্টুডেন্ট বাস কার্ডে ক্লিক করে
  → openBusDetails(busId)
    → Leaflet.js দিয়ে ম্যাপ তৈরি: L.map('bus-map').setView([23.8122, 90.3582], 15)
    → OpenStreetMap টাইল লোড: L.tileLayer('https://{s}.tile.openstreetmap.org/...')
    → বাসের আইকন 🚌 ম্যাপে বসানো: L.marker([lat, lng], {icon: busIcon})
    → updateLiveBusLocation(busId) কল
    → renderStopMarkers(bus) কল [রুটের স্টপেজ পিন ম্যাপে দেখানো]
```

#### ৪. লাইভ বাস ট্র্যাকিং (updateLiveBusLocation)
```
updateLiveBusLocation(busId)
  → bus.currentLocation থেকে latitude, longitude নেয়
  → currentBusMarker.setLatLng(newLatLng) [ম্যাপের বাস আইকন সরায়]
  → currentMap.panTo(newLatLng) [ক্যামেরা বাসের দিকে ঘোরায়]
  → updateEtaInfo(bus, newLatLng) কল করে [দূরত্ব ও ETA হিসাব]
```

#### ৫. ETA (কত মিনিট লাগবে) হিসাব (updateEtaInfo)
```
updateEtaInfo(bus, busLatLng)
  → রুটের সব স্টপেজ থেকে বাসের দূরত্ব মাপে
  → সবচেয়ে কাছের স্টপেজ খুঁজে বের করে (nearestStopIndex)
  → বাস কোথায় আছে তা দেখায় (যেমন: "Currently at: Mirpur 10")
  → গন্তব্য পর্যন্ত দূরত্ব মাপে: getDistanceFromLatLonInMeters()
  → গতি ধরে নেয়: 5.5 মি/সেকেন্ড (≈ 20 কি.মি./ঘণ্টা)
  → সময় = দূরত্ব ÷ গতি = ETA (মিনিটে)
```

**দূরত্ব মাপার সূত্র (Haversine Formula):**
```javascript
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // পৃথিবীর ব্যাসার্ধ মিটারে
    // ... Haversine ক্যালকুলেশন
}
```

#### ৬. স্টুডেন্টের নিজের লোকেশন (requestStudentLocation)
```
স্টুডেন্ট "Calculate from My Location" বাটনে ক্লিক
  → navigator.geolocation.getCurrentPosition()
    → ব্রাউজার GPS অন করে
    → স্টুডেন্টের lat/lng পায়
    → ম্যাপে নীল আইকন 🧍 বসায়
    → ETA এখন স্টুডেন্টের লোকেশন থেকে হিসাব হয়
```

---

### 🚐 driver-dashboard.js — ড্রাইভার ড্যাশবোর্ড

#### ১. ভাষা সাপোর্ট (ইংরেজি + বাংলা)
```
translations = { en: {...}, bn: {...} }
toggleLanguage() → ইংরেজি ↔ বাংলা পরিবর্তন
```

#### ২. ড্রাইভারের ডেটা লোড (fetchDriverData)
```
fetchDriverData()
  → Firebase Query: buses কালেকশন থেকে assignedDriver == currentDriverUser.uid
  → বাস পাওয়া গেলে:
    → assignedBusId ও assignedBusName সেট করে
    → routes কালেকশন থেকে assignedBus == busId দিয়ে রুট খুঁজে
    → fetchSchedules() কল করে
    → checkActiveTrips() কল করে [কোনো চলমান ট্রিপ আছে কিনা]
```

#### ৩. ট্রিপ শুরু করা (startTrip → confirmTripStart)
```
ড্রাইভার "START" বাটনে ক্লিক
  → Trip Setup Modal ওপেন হয়
  → ড্রাইভার Direction (Start→End / End→Start) ও Time সিলেক্ট করে
  → "Start Trip" বাটনে ক্লিক
    → startTrip() কল হয়
      → startGpsTracking(true) [GPS চালু করে]
        → navigator.geolocation.watchPosition() [প্রতি কয়েক সেকেন্ড পরপর লোকেশন নেয়]
          → handleGpsSuccess() → processLocationUpdate()
            → প্রথম GPS পেলে → confirmTripStart() কল হয়
              → Firestore "trips" কালেকশনে নতুন ডকুমেন্ট তৈরি
              → buses কালেকশনে status = "running" সেট করে
              → notifications কালেকশনে "bus_started" নোটিশ পাঠায়
```

#### ৪. GPS ব্রডকাস্ট (processLocationUpdate) — সবচেয়ে গুরুত্বপূর্ণ!
```
প্রতি 5 সেকেন্ড পরপর:
processLocationUpdate(latitude, longitude, accuracy)
  → Firestore আপডেট:
    await updateDoc(doc(db, "buses", assignedBusId), {
        currentLocation: { latitude, longitude, accuracy, timestamp }
    })
  
  ↓ এই ডেটা আপডেট হওয়ামাত্রই...
  
  student-dashboard.js এর onSnapshot ট্রিগার হয়
  → allBuses আপডেট হয়
  → updateLiveBusLocation() কল হয়
  → ম্যাপে বাসের আইকন সরে যায়!
```

**এটিই হলো পুরো সিস্টেমের মূল সংযোগ — ড্রাইভারের GPS → Firebase → স্টুডেন্টের ম্যাপ।**

#### ৫. ট্রিপ বন্ধ (stopTrip)
```
ড্রাইভার "STOP" বাটনে ক্লিক
  → trips কালেকশনে status = "completed" সেট
  → notifications কালেকশনে "bus_stopped" নোটিশ
  → buses কালেকশনে status = "active", currentLocation = null
  → GPS tracking বন্ধ: navigator.geolocation.clearWatch()
```

#### ৬. দেরির নোটিশ (delayBus)
```
ড্রাইভার "DELAY" বাটনে ক্লিক
  → notifications কালেকশনে নতুন ডকুমেন্ট তৈরি:
    { busId, type: 'bus_delayed', message: "Bus is delayed..." }
  → student-dashboard.js এর notification listener এটি ধরে অ্যালার্ট দেখায়
```

---

### 👨‍💼 admin-dashboard.js — অ্যাডমিন ড্যাশবোর্ড

#### ১. সেকশন নেভিগেশন
```
switchSection('users')      → Users সেকশন দেখায়
switchSection('drivers')    → Drivers সেকশন দেখায়
switchSection('buses')      → Buses সেকশন দেখায়
switchSection('routes')     → Routes সেকশন দেখায়
switchSection('schedules')  → Schedules সেকশন দেখায়
switchSection('announcements') → Announcements সেকশন দেখায়
switchSection('analytics')  → Analytics সেকশন দেখায়
switchSection('reports')    → Reports সেকশন দেখায়
```

#### ২. ড্রাইভার ম্যানেজমেন্ট
```
setupDashboard()
  → Firebase onSnapshot: users কালেকশনে role == "driver" শোনে
  → ড্রাইভারদের লিস্ট আনে
  → updateStats() [Total, Pending, Approved, Rejected কাউন্ট]
  → renderDrivers() [কার্ডে দেখায়]
    → প্রতি কার্ডে Approve/Reject বাটন থাকে
```

#### ৩. ড্রাইভার Approve/Reject (updateDriverStatus)
```
অ্যাডমিন "✅ Approve" বাটনে ক্লিক
  → updateDriverStatus(driverId, 'active')
    → ApiService.fetchWithAuth('/Auth/user/{uid}/status', { method: 'PUT', body: { status: 'active' } })
      → api.js (টোকেনসহ রিকোয়েস্ট পাঠায়)
        → C# Backend: PUT /api/auth/user/{uid}/status
          → AuthController.UpdateUserStatus()
            → AuthService.UpdateUserStatusAsync()
              → Firebase Firestore: users/{uid}/status = "active"
```

---

## 🔄 সম্পূর্ণ ওয়ার্কফ্লো (A to Z)

### ওয়ার্কফ্লো ১: ল্যান্ডিং পেজ → লগইন → ড্যাশবোর্ড

```
ব্রাউজারে index.html ওপেন করলো
  ↓
app.js লোড হলো
  → initAuthGuard(false) চেক করে: ইউজার কি আগে থেকে লগইন আছে?
    → হ্যাঁ → সরাসরি dashboard এ redirect
    → না → ল্যান্ডিং পেজ দেখায় (কাউন্টার অ্যানিমেশন, ফিচার কার্ড)
  ↓
ইউজার "Get Started" বা "Login" এ ক্লিক করে
  ↓
role-select.html লোড হয় (role-select.js অ্যানিমেশন দেখায়)
  → ইউজার Student / Driver / Admin সিলেক্ট করে
  ↓
login.html?role=student লোড হয়
  → auth.js লোড হয়
    → getRoleFromURL() → URL থেকে role বের করে
    → applyRoleTheme(role) → রোল অনুযায়ী কালার পরিবর্তন
  ↓
ইউজার ইমেইল + পাসওয়ার্ড দিয়ে Submit করে
  → auth.js → handleLoginSubmit(role)
    → Firebase Auth: signInWithEmailAndPassword()
    → Firestore থেকে প্রোফাইল পড়ে (role, status চেক)
    → ইমেইল ভেরিফাই না হলে → verify-otp.html
    → ড্রাইভার pending হলে → "Admin approval দরকার" মেসেজ
    → সব ঠিক হলে → dashboard.html?role=student
  ↓
dashboard.html লোড হয় → dashboard.js রোল চেক করে →
  → role=student → student-dashboard.html এ redirect
  → role=driver → driver-dashboard.html এ redirect
  → role=admin → admin-dashboard.html এ redirect
```

---

### ওয়ার্কফ্লো ২: রেজিস্ট্রেশন → OTP → ড্যাশবোর্ড

```
ইউজার register.html?role=student এ যায়
  ↓
auth.js → handleRegisterSubmit(role)
  → Firebase Auth: createUserWithEmailAndPassword(email, password)
    → Firebase নতুন UID তৈরি করে
  → Firestore: setDoc(doc(db, "users", uid), { uid, name, email, role, status, createdAt })
    → ডেটাবেসে প্রোফাইল সেভ
  → verify-otp.html এ redirect
  ↓
verify-otp.html লোড হয়
  → "Send OTP" বাটনে ক্লিক
    → api.js → fetchWithAuth('/Auth/send-otp', { method: 'POST' })
      → C# Backend: AuthController.SendOtp()
        → Random কোড তৈরি: random.Next(100000, 999999) = "482651"
        → AuthService.SaveOtpAsync(uid, "482651", expiresAt) → ডেটাবেসে সেভ
        → EmailService.SendOtpEmailAsync(email, "482651", name)
          → Brevo API কল → ইউজারের ইমেইলে সুন্দর HTML মেইল পাঠায়
  ↓
ইউজার ইমেইল চেক করে কোড পায় → অ্যাপে কোড বসায় → Submit
  → api.js → fetchWithAuth('/Auth/verify-otp', { method: 'POST', body: { code: "482651" } })
    → C# Backend: AuthController.VerifyOtp()
      → AuthService.VerifyOtpAsync(uid, "482651")
        → ডেটাবেসে সেভ করা কোড মেলায়
        → সময় শেষ হয়নি তো চেক করে (10 মিনিট)
        → মিললে → isEmailVerified = true সেট করে
        → Firebase Auth এ ও EmailVerified = true করে দেয়
  ↓
ভেরিফাই হয়ে গেলে → dashboard এ redirect
```

---

### ওয়ার্কফ্লো ৩: বাসের লাইভ ট্র্যাকিং (Driver → Student)

```
=== ড্রাইভার সাইড ===
ড্রাইভার driver-dashboard.html ওপেন করে
  → auth-guard.js চেক: role == driver? status == active? ✅
  → fetchDriverData() → Firebase থেকে assignedBus খুঁজে
  ↓
ড্রাইভার "START" বাটনে ক্লিক
  → Trip Setup Modal ওপেন
  → Direction ও Time সিলেক্ট করে → "Start Trip"
  ↓
startTrip()
  → startGpsTracking(true)
    → navigator.geolocation.watchPosition(handleGpsSuccess, ...)
  ↓
প্রতি কয়েক সেকেন্ড পরপর GPS নতুন লোকেশন দেয়
  → handleGpsSuccess(position)
    → processLocationUpdate(lat, lng, accuracy)
      → Firestore Update:
        db → buses → {busId} → currentLocation: { latitude: 23.81, longitude: 90.35 }
      → buses কালেকশনে status: "running"

=== Firebase Firestore (মাঝখানে) ===
buses/{busId}/currentLocation পরিবর্তন হলো!
  ↓ (রিয়েল-টাইম সিঙ্ক)

=== স্টুডেন্ট সাইড ===
student-dashboard.js এর listenToBuses() এর onSnapshot ট্রিগার হয়
  → allBuses আপডেট হয়
  → বাসটি যদি সিলেক্টেড থাকে → updateLiveBusLocation(busId)
    → bus.currentLocation থেকে নতুন lat/lng পায়
    → currentBusMarker.setLatLng([23.81, 90.35]) → ম্যাপে বাস সরে!
    → currentMap.panTo([23.81, 90.35]) → ক্যামেরা ও সরে!
    → updateEtaInfo(bus, [23.81, 90.35])
      → দূরত্ব মাপে (Haversine formula)
      → ETA = দূরত্ব ÷ 5.5 m/s → "12 min" দেখায়
```

---

### ওয়ার্কফ্লো ৪: অ্যাডমিন নতুন বাস যোগ করা

```
অ্যাডমিন admin-dashboard.html → Buses সেকশন → "Add Bus" বাটন
  ↓
bus-management.js → Modal ওপেন হয়
  → অ্যাডমিন বাসের নাম, নম্বর, সিটসংখ্যা দেয়
  → "Save" বাটনে ক্লিক
  ↓
bus-management.js
  → ApiService.fetchWithAuth('/Bus', { method: 'POST', body: JSON.stringify(busData) })
    → api.js → auth.currentUser.getIdToken() [টোকেন নেয়]
      → fetch('http://localhost:5196/api/bus', { headers: { Authorization: 'Bearer TOKEN' }, body: busData })
  ↓
C# Backend রিকোয়েস্ট রিসিভ করে:
  → JWT Token যাচাই করে (Program.cs এর Authentication middleware)
  → ইউজারের রোল চেক করে: role == "admin"? ✅
  → BusController.CreateBus(request)
    → বাসের নাম ও নম্বর খালি কিনা চেক
    → BusService.CreateBusAsync(bus)
      → Firebase Firestore: buses কালেকশনে নতুন ডকুমেন্ট তৈরি
      → Auto ID তৈরি করে
      → CreatedAt ও UpdatedAt সেট করে
    → 201 Created রিটার্ন করে
  ↓
Frontend সফল রেসপন্স পায়
  → Toast notification দেখায়: "Bus created successfully!"
  → bus-management.js → Firebase onSnapshot এর মাধ্যমে বাসের লিস্ট অটো-আপডেট
```

---

### ওয়ার্কফ্লো ৫: নোটিফিকেশন সিস্টেম

```
ড্রাইভার "DELAY" বাটনে ক্লিক
  → driver-dashboard.js → delayBus()
    → Firestore: notifications কালেকশনে নতুন ডকুমেন্ট:
      { busId, type: 'bus_delayed', message: "Bus is delayed...", timestamp }
  ↓
student-dashboard.js এ initNotifications() ফাংশন চলছে
  → onSnapshot: notifications কালেকশন শুনছে
  → নতুন নোটিফিকেশন পেলে:
    → স্ক্রিনে একটি পপআপ/ব্যানার দেখায়
    → সাউন্ড বাজায় (যদি থাকে)
```

---

### ওয়ার্কফ্লো ৬: গ্রুপ চ্যাট

```
স্টুডেন্ট "Bus Chat" সেকশনে যায়
  → student-dashboard.js → initChat()
    → বাসের লিস্ট দেখায়
    → স্টুডেন্ট একটি বাস সিলেক্ট করে
    → openChatRoom(busId, busName)
      → Firestore: chats/{busId}/messages কালেকশন onSnapshot দিয়ে শোনে
      → পুরাতন মেসেজ লোড হয়
      → নতুন মেসেজ আসলে সাথে সাথে দেখায়
  ↓
স্টুডেন্ট মেসেজ লিখে Send করে
  → addDoc(collection(db, "chats", busId, "messages"), { text, sender, timestamp })
  → অন্যান্য স্টুডেন্টদের onSnapshot ট্রিগার হয়
  → সবার স্ক্রিনে নতুন মেসেজ ভেসে ওঠে
```

---

## 📡 API এন্ডপয়েন্ট তালিকা

সব API কলের সম্পূর্ণ তালিকা:

| Method | Endpoint | কাজ | ব্যবহৃত ফাইল |
|--------|----------|------|------------|
| GET | `/api/auth/me` | নিজের প্রোফাইল | student/driver dashboard |
| GET | `/api/auth/user/{uid}` | ইউজার ডিটেইলস | admin-dashboard |
| GET | `/api/auth/users/role/{role}` | রোল ভিত্তিক ইউজার লিস্ট | user-management.js |
| PUT | `/api/auth/user/{uid}/status` | Approve/Reject | admin-dashboard.js |
| POST | `/api/auth/send-otp` | OTP ইমেইল পাঠানো | verify-otp পেজ |
| POST | `/api/auth/verify-otp` | OTP যাচাই | verify-otp পেজ |
| PUT | `/api/auth/profile` | প্রোফাইল আপডেট | settings সেকশন |
| DELETE | `/api/auth/account` | একাউন্ট ডিলিট | settings সেকশন |
| GET | `/api/bus` | সব বাস | bus-management.js |
| POST | `/api/bus` | বাস তৈরি | bus-management.js |
| PUT | `/api/bus/{id}` | বাস আপডেট | bus-management.js |
| DELETE | `/api/bus/{id}` | বাস ডিলিট | bus-management.js |
| GET | `/api/route` | সব রুট | route-management.js |
| POST | `/api/route` | রুট তৈরি | route-management.js |
| PUT | `/api/route/{id}` | রুট আপডেট | route-management.js |
| DELETE | `/api/route/{id}` | রুট ডিলিট | route-management.js |
| GET | `/api/schedule` | সব শিডিউল | schedule-management.js |
| POST | `/api/schedule` | শিডিউল তৈরি | schedule-management.js |
| PUT | `/api/schedule/{id}` | শিডিউল আপডেট | schedule-management.js |
| DELETE | `/api/schedule/{id}` | শিডিউল ডিলিট | schedule-management.js |
| POST | `/api/announcement` | নোটিশ তৈরি | announcement-management.js |
| PUT | `/api/announcement/{id}` | নোটিশ আপডেট | announcement-management.js |
| DELETE | `/api/announcement/{id}` | নোটিশ ডিলিট | announcement-management.js |

---

## 🏗️ আর্কিটেকচার ডায়াগ্রাম (টেক্সট ফরম্যাটে)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Student  │  │ Driver   │  │ Admin    │               │
│  │Dashboard │  │Dashboard │  │Dashboard │               │
│  │   .js    │  │   .js    │  │   .js    │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │              │              │                     │
│       │   ┌──────────┴──────────┐   │                     │
│       │   │   firebase-config.js │   │                     │
│       │   │   (Firebase Client)  │   │                     │
│       │   └──────────┬──────────┘   │                     │
│       │              │              │                     │
│       │         ┌────┴────┐         │                     │
│       │         │ api.js  │         │                     │
│       │         │ (Bridge)│         │                     │
│       │         └────┬────┘         │                     │
│       │              │              │                     │
│  ─────┼──────────────┼──────────────┼─────────────────── │
│  Real-Time Path      │        API Path                    │
│  (GPS, Chat,         │        (CRUD, Auth,                │
│   Notifications)     │         OTP)                       │
└───────┼──────────────┼──────────────┼─────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌───────────────┐  ┌──────────────────────────────────┐
│               │  │     BACKEND (C# ASP.NET Core)     │
│   Firebase    │  │                                    │
│   Firestore   │  │  Controllers → Services → Firestore│
│  (Real-time   │  │                                    │
│   Database)   │  │  AuthController → AuthService      │
│               │  │  BusController → BusService        │
│   buses/      │  │  RouteController → RouteService    │
│   users/      │  │  ScheduleController → ScheduleService│
│   trips/      │  │  AnnouncementController →           │
│   chats/      │  │       AnnouncementService           │
│   notifications/│ │  EmailService → Brevo API           │
│   routes/     │  │                                    │
│   schedules/  │  └──────────────────────────────────┘
│   announcements/│
└───────────────┘
```

**দুটি পথ (Two Paths):**
1. **Real-Time Path (সরাসরি):** GPS ডেটা, চ্যাট মেসেজ, নোটিফিকেশন — এগুলো ফাস্ট হতে হয়, তাই ফ্রন্টএন্ড সরাসরি Firebase Firestore এ পড়ে/লেখে। ব্যাকএন্ড হয়ে যায় না।
2. **API Path (ব্যাকএন্ড হয়ে):** বাস তৈরি, ড্রাইভার Approve, OTP পাঠানো — এগুলো সিকিউর হতে হয়, তাই ফ্রন্টএন্ড → `api.js` → C# Backend → Firebase।

---

*এই ডকুমেন্টটি পুরো Smart Campus Bus প্রজেক্টের সম্পূর্ণ গাইড। যেকোনো সময় যেকোনো ফাইল সম্পর্কে জানতে চাইলে এখান থেকে খুঁজে নিতে পারবেন।* 🚌
