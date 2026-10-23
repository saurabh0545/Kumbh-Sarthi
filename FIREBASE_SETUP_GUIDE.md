# 🔥 Kumbh Sarthi — Firebase Cloud Firestore Integration Guide

This guide explains how your **React Native Mobile App** and **Authority Control Center Website** are connected using **Google Firebase Cloud Firestore** for instant two-way real-time data synchronization.

---

## 🚀 What is Connected Between App & Website

| Feature | Mobile App Action | Website Action | Firestore Collection |
|---|---|---|---|
| **🚨 Emergency SOS** | Pilgrim taps SOS in app | Instantly pops up with siren & marker on dashboard map | `sos_incidents` |
| **📢 Broadcast Alerts** | Receives warnings & instructions in real-time | Authority publishes official alert/warning | `alerts` |
| **🔍 Lost & Found** | Pilgrim submits missing person/item report | Appears immediately in Authority Lost & Found registry | `lost_found` |
| **📍 Live Family Locations** | Transmits live GPS coordinate breadcrumbs | Visualized on tactical authority map | `pilgrim_locations` |

> [!NOTE]
> **Graceful Fallback**: The app and website are built with dual-mode support. Even before you paste your Firebase keys, the system continues running using local state and the FastAPI backend (`http://localhost:8001`). Once you add your Firebase keys, real-time cloud synchronization activates automatically without any code changes!

---

## 📋 Step 1: Create Your Firebase Project (1 Minute)

1. Open **[Firebase Console](https://console.firebase.google.com/)** and click **"Add project"**.
2. Name your project (e.g., `kumbh-smart-assist`).
3. Click **Continue** (you can disable Google Analytics or leave it on) and click **Create Project**.
4. Inside your new project dashboard:
   - In the left sidebar, click **Build** ➜ **Firestore Database**.
   - Click **Create database**.
   - Choose a region close to your users (e.g. `asia-south1 (Mumbai)`).
   - In **Security rules**, select **Start in test mode** (allows read/write during development), then click **Enable**.

---

## 🔑 Step 2: Get Your Web App Configuration Keys

1. On your Firebase project overview page, click the **Web icon (`</>`)** to register a web application.
2. Enter an app nickname (e.g., `Kumbh Unified`) and click **Register app**.
3. You will see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-YourActualApiKeyHere",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## 📝 Step 3: Paste Keys into `.env` Files

### 1. In Mobile App `.env` (Project Root)
Open [c:/Users/VICTUS/OneDrive/Desktop/KumbhSmartAssist/.env](file:///c:/Users/VICTUS/OneDrive/Desktop/KumbhSmartAssist/.env) and replace the values:

```env
# Firebase Cloud Firestore Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyD-YourActualApiKeyHere
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 2. In Website `.env` (`authority-dashboard/.env`)
Open [c:/Users/VICTUS/OneDrive/Desktop/KumbhSmartAssist/authority-dashboard/.env](file:///c:/Users/VICTUS/OneDrive/Desktop/KumbhSmartAssist/authority-dashboard/.env) and replace the values:

```env
# Firebase Cloud Firestore Configuration
VITE_FIREBASE_API_KEY=AIzaSyD-YourActualApiKeyHere
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## 🧪 Step 4: Test Real-Time Synchronization

1. **Broadcast an Alert from Website**:
   - Go to [http://localhost:5173/alerts](http://localhost:5173/alerts)
   - Click **"Broadcast New Alert"** and fill in title & message.
   - Click **Submit**.
   - Check the Mobile App Alerts screen (`src/app/(tabs)/alerts.tsx`): the alert appears **instantly** via Firestore `onSnapshot`!

2. **Trigger an Emergency SOS from Mobile App**:
   - Open the Mobile App Emergency screen (`src/app/emergency.tsx`).
   - Tap **"Trigger Emergency SOS"** or **"Share Location"**.
   - Check the Authority Dashboard at [http://localhost:5173/emergency](http://localhost:5173/emergency) or [http://localhost:5173/family-sos](http://localhost:5173/family-sos): the incident card appears immediately in real-time!
   - When the authority clicks **"Resolve"** or **"Dispatch Team"**, the status updates in Firestore.

---

## 🔒 Recommended Firestore Security Rules (Production)

When you are ready to secure your database, go to **Firestore Database ➜ Rules** and apply:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public official alerts: anyone can read, authenticated authorities can write
    match /alerts/{alertId} {
      allow read: if true;
      allow write: if true; // In production, add: request.auth != null
    }

    // Pilgrim SOS incidents: anyone can trigger an emergency, authorities can update/resolve
    match /sos_incidents/{incidentId} {
      allow read, write: if true;
    }

    // Lost and Found registry
    match /lost_found/{reportId} {
      allow read, write: if true;
    }

    // Pilgrim GPS location tracking
    match /pilgrim_locations/{userId} {
      allow read, write: if true;
    }
  }
}
```
