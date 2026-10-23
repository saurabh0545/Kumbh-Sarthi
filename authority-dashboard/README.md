# Kumbh Sarthi — Authority Web Dashboard

Smart Intelligence & Public Safety Command Center for Nashik Kumbh Mela.

Built with **React 18 + TypeScript + Vite**.

---

## Architecture

```
Authority Dashboard (React + Vite)
        ↓ (HTTP / REST)
     FastAPI Backend (Port 8001)
        ↓
   MySQL Database (kumbh_smart_assist)

Surveillance Camera (Optical Sensor)
        ↓
    YOLO Model (yolo11n.pt / yolov8n.pt)
        ↓
   FastAPI Endpoint (/api/crowd/update)
        ↓
   Authority Dashboard (Real-time Gate 1 Feed)
        +
   Kumbh Sarthi Mobile App
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+
- MySQL Server running on `localhost:3306`

### 2. Configure Backend API URL
Create or edit `.env` in `authority-dashboard/`:
```bash
VITE_API_BASE_URL=http://localhost:8001
```
*(Defaults automatically to `http://localhost:8001` if unset).*

### 3. Launch Development Dashboard
```bash
cd authority-dashboard
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
cd authority-dashboard
npm run build
```

---

## Authority Login Credentials
- **Commander**: `officer@kumbh.gov.in` / `officer123`
- **Director**: `admin@kumbh.gov.in` / `admin123`
- **Police Chief**: `police@kumbh.gov.in` / `police123`
- Or any registered pilgrim/officer in the MySQL database.
