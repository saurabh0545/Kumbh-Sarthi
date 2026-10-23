# Kumbh Sarthi — Smart Pilgrim & Crowd Management System 🚩
> **AI-Powered Crowd Monitoring, Real-Time Family Location Tracking, Biometric Lost & Found, and Authority Command Center for Nashik Kumbh Mela 2027.**

---

## 🌟 Overview

**Kumbh Sarthi** is a comprehensive smart assistance ecosystem engineered for the grand **Nashik Kumbh Mela 2027**. It unites three core platforms into a synchronized, real-time architecture:

1. **Pilgrim Mobile Application (React Native / Expo):**
   - Real-time crowd density meters for all gates & ghats.
   - Interactive cartographic map with low-crowd routing and dedicated **Offline Vector Map mode**.
   - Multi-device **Family Tracking** with live GPS coordinates, distance indicators, and privacy toggles.
   - Emergency SOS broadcasting with exact coordinates to family & authority control center.
   - Multilingual support: English, Marathi (मराठी), and Hindi (हिंदी).

2. **Authority Control Center (React + TypeScript + Vite):**
   - Real-time command dashboard with crowd surge alerts and gate capacity analytics.
   - Live CCTV AI detection view and interactive incident dispatch map.
   - Real-time synchronization via **Firebase Cloud Firestore**.

3. **AI Backend & Biometric Engine (FastAPI + PyTorch + OpenCV):**
   - **YOLO** deep neural network for automated gate crowd counting and surge prediction.
   - **YuNet + SFace Biometric Engine** for facial detection and 128-dimensional biometric recognition to reunite lost pilgrims.
   - MySQL database integration via SQLAlchemy.

---

## 📂 Project Structure

```
KumbhSmartAssist/
│
├── src/                       # Pilgrim Mobile Application (React Native / Expo)
│   ├── app/                   # Expo Router screens (Tabs, Family, Emergency, Routes)
│   ├── components/kumbh/      # Reusable UI components (MapView, FamilyCard, Buttons)
│   ├── services/              # API, Firebase Firestore sync, and Local Storage
│   ├── context/               # Global state (AuthContext, SettingsContext)
│   ├── hooks/                 # Location, Gate crowd polling hooks
│   └── constants/             # Kumbh theme, colors, typography
│
├── backend/                   # FastAPI Backend & AI Vision Pipeline
│   ├── main.py                # FastAPI server & REST API endpoints
│   ├── face_engine.py         # YuNet + SFace Biometric Face Recognition engine
│   ├── crowd_service.py       # YOLO crowd counting & density analytics
│   ├── crowd_camera.py        # Real-time RTSP/Webcam stream inference
│   ├── database.py            # MySQL database connection
│   └── test_crowd.py          # Dual-sync crowd simulation tool
│
├── authority-dashboard/       # Authority Command Center Web Application
│   ├── src/components/        # Live monitoring panels, maps, incident tables
│   ├── src/services/          # Backend API & Firebase sync clients
│   └── vite.config.ts         # Vite bundler configuration
│
├── scripts/                   # Production build and packaging utilities
│   ├── package_apk.py         # Automated zipalign & apksigner utility
│   └── ...
│
├── .env.example               # Environment variables template
├── .gitignore                 # GitHub ignore rules (protects large APKs & secrets)
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)
- **MySQL Server** (running locally or remotely)
- **Expo Go** app on your phone (for mobile development)

---

### 2. Backend Setup (FastAPI & AI Engine)

1. Open a terminal in the root directory:
   ```bash
   # Install Python requirements
   pip install fastapi uvicorn sqlalchemy pymysql opencv-python torch torchvision ultralytics
   ```

2. Configure your MySQL database in `.env`:
   ```ini
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/kumbh_smart_assist
   ```

3. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
   ```
   *API Swagger Docs will be available at:* `http://localhost:8001/docs`

---

### 3. Authority Dashboard Setup (Web)

1. Navigate to the dashboard directory:
   ```bash
   cd authority-dashboard
   npm install
   npm run dev
   ```
2. Open your browser at **`http://localhost:5173`**.

---

### 4. Pilgrim Mobile App Setup (Expo)

1. From the project root, copy the environment template:
   ```bash
   copy .env.example .env
   ```
   *(Update `EXPO_PUBLIC_API_URL` with your computer's local Wi-Fi IP and insert your Firebase credentials).*

2. Start the Expo development server:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code using the **Expo Go** app on Android or iOS.

---

### 5. Building the Standalone Android APK

An automated packaging and signing pipeline is provided:
```bash
BUILD_UPDATED_APK.bat
```
This exports the React Native bundle, zipaligns the APK, and signs it using Android SDK build-tools, outputting **`KumbhSarthi_Updated.apk`**.

---

## 🔒 Security & Privacy Notice
- Personal live location sharing in the Family section is **opt-in only** with explicit user consent toggles.
- Environment secrets (`.env`) and large binaries (`*.apk`) are ignored in version control via `.gitignore`. Always use `.env.example` as a template.

---

## 📜 License
This project is open-source and licensed under the [MIT License](LICENSE).
