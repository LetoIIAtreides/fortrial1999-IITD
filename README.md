# AAROGYA LINK — Online-First Emergency Healthcare & Community Response Platform

> **Tagline:** “Share Help. Save Lives.”  
> **Mission:** Emergency healthcare reporting, status tracking, and authorized responder dispatch coordination for disaster-affected areas (floods, landslides, remote mountain regions).  
> **Scope:** **ONLINE-ONLY IMPLEMENTATION**. Modular, robust foundation designed for future mesh extensibility without rewrites.

---

## 1. System Architecture

```
iiid/
├── android/                  # Android Native App (Kotlin, Compose, Room/SQLite, Retrofit, WorkManager)
│   ├── app/src/main/
│   │   ├── java/org/aarogyalink/
│   │   │   ├── data/
│   │   │   │   ├── local/    # SQLite/Room persistent storage (ReportEntity, AarogyaDatabaseHelper)
│   │   │   │   ├── remote/   # Retrofit 2 REST client, DTOs, OkHttp logging
│   │   │   │   ├── repository/ # EmergencyReportRepository (Modular transport boundary)
│   │   │   │   └── sync/     # WorkManager SyncWorker & NetworkMonitor
│   │   │   ├── ui/
│   │   │   │   ├── navigation/ # Compose Navigation routes
│   │   │   │   ├── screens/  # HomeScreen, ReportEmergency, MyReports, Facilities, EmergencyMap, HelpInfo
│   │   │   │   ├── theme/    # Material 3 theme, accessible typography, color tokens
│   │   │   │   └── viewmodel/# ReportViewModel (Form, Persistence, TTS), FacilitiesViewModel
│   │   │   ├── AarogyaApplication.kt
│   │   │   └── MainActivity.kt
│   │   └── res/
│   │       ├── values/strings.xml (English)
│   │       ├── values-hi/strings.xml (Hindi localization)
│   │       └── ...
│   └── build/outputs/apk/debug/app-debug.apk  (Successfully compiled APK)
│
├── backend/                  # FastAPI REST API + SQLAlchemy + Pydantic v2 + Alembic + Auth + Audit
│   ├── app/
│   │   ├── api/              # /health, /reports, /sync, /facilities, /auth
│   │   ├── core/             # JWT security, bcrypt passwords, RBAC permissions
│   │   ├── db/               # SQLAlchemy engine, session, database seeder
│   │   ├── models/           # Report, Facility, User, VerificationAuditLog
│   │   └── schemas/          # Pydantic v2 validation models
│   ├── tests/                # Pytest integration test suite
│   ├── test_e2e_flow.py      # End-to-end full system verification script
│   ├── requirements.txt
│   └── main.py
│
└── dashboard/                # Responder Web Dashboard (React 18 + TypeScript + Vite + Leaflet)
    ├── src/
    │   ├── api/              # Typed REST client with JWT interceptor
    │   ├── components/       # MetricCards, ReportList, ReportDetailModal, MapView, FacilitiesList, LoginModal
    │   ├── types/            # TypeScript interfaces
    │   ├── App.tsx
    │   └── index.css         # Modern, high-aesthetic styling, accessible contrast
    └── dist/                 # Production-built bundle (HTML, CSS, JS)
```

---

## 2. Completed Features & Acceptance Criteria Verification

| Requirement | Implementation Details | Test / Build Status |
|---|---|---|
| **Android Application Compilation** | Kotlin 2.2.10, AGP 9.3.1, Jetpack Compose, Material 3, SDK 36 | **BUILD SUCCESSFUL** (`app-debug.apk` 20.1 MB) |
| **Local Persistence before Network** | SQLite `AarogyaDatabaseHelper` saves reports locally before network request with stable UUID | **VERIFIED** (Flow-reactive updates) |
| **Server Idempotence** | Client-generated UUID `report_id` prevents duplicate server records on retry | **VERIFIED** (`test_e2e_flow.py` & pytest) |
| **FastAPI Backend & DB Persistence** | FastAPI 0.110.0, SQLAlchemy 2.0, Alembic, PostgreSQL / SQLite engine | **VERIFIED** (7/7 pytest tests passed) |
| **Responder Web Dashboard** | React 18, TypeScript, Vite 5, Leaflet maps, Lucide icons, glassmorphism | **VERIFIED** (`npm run build` completed) |
| **Authorized Verification & Audit Log** | JWT Bearer authentication, RBAC (`responder`, `admin`), immutable `verification_audit_logs` | **VERIFIED** (401 on unauthenticated, 200 on authorized) |
| **Status Reflection in App** | Mobile app retrieves server-confirmed status (`VERIFIED`/`RESOLVED`) via `/sync/pull` | **VERIFIED** (`test_e2e_flow.py`) |
| **112 Emergency Notice** | “If you have a working phone signal and need urgent help, call 112 first” with direct dial | **IMPLEMENTED** in Android & Dashboard |
| **Accessibility & Spoken Labels** | Android `TextToSpeech` readout, bilingual English/Hindi, 48dp touch targets | **IMPLEMENTED** |
| **No Fake Mesh/BLE Claims** | Modular repository interface without speculative BLE, Rust, or mesh dependencies | **STRICTLY ENFORCED** |

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+ / v24+
- Android Studio / Android SDK (API 34+)

### 1. Starting the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
- API runs at: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Starting the Responder Dashboard
```bash
cd dashboard
npm install
npm run dev
```
- Dashboard runs at: `http://localhost:5173`
- Default Responder Credentials:
  - **SDRF Responder:** `responder_ravi` / `Responder@12345`
  - **Community Health Officer:** `responder_anita` / `Responder@12345`
  - **Chief Admin:** `admin` / `Admin@12345`

### 3. Running Backend Automated Tests
```bash
cd backend
python -m pytest -v
python test_e2e_flow.py
```

### 4. Android Application
```bash
cd android
./gradlew assembleDebug
```
Output APK location:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. Emergency Categories & Urgency Levels

### Categories
1. **Pregnancy** — Labor, prenatal/postnatal emergency in isolated area
2. **Diabetes** — Insulin disruption, ketoacidosis, hypoglycemic event
3. **Bleeding** — Acute traumatic hemorrhage or laceration
4. **Fever** — High persistent fever, waterborne infections
5. **Injury** — Fractures, crushing trauma, rockfall/landslide injuries
6. **Medicine needed** — Essential maintenance prescription washed away

### Urgency Levels
- **High** — Urgent help needed (Immediate triage priority)
- **Medium** — Needs attention soon (Urgent stabilization within hours)
- **Low** — Can wait (Relief supplies or non-acute guidance)
*Disclaimer: Urgency is community self-reported and is not a clinical medical diagnosis.*
