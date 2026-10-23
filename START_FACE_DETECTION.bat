@echo off
title Kumbh Sarthi - Live AI Face Detection & Recognition
color 0B
echo ===================================================================
echo     KUMBH SARTHI - OPTICAL FACE DETECTION & RECOGNITION AI
echo ===================================================================
echo   Backend AI Engine : http://localhost:8001/api/face/status
echo   Website Studio    : http://localhost:5173/face-detection
echo   Model             : OpenCV Haar Cascade + KNN (Trained: Saurabh)
echo ===================================================================
echo.
echo Choose how you would like to run Face Detection:
echo   [1] Launch Live Desktop Webcam Detector (OpenCV HUD Window)
echo   [2] Launch Web AI Studio in Browser (Full Authority Dashboard)
echo   [3] Launch BOTH (Backend + Web Studio + Desktop Webcam)
echo   [4] Launch COMBINED AI (Face Detection + People Count on same camera)
echo.
set /p choice="Enter option [1, 2, 3, or 4] (default 1): "

if "%choice%"=="" set choice=1

if "%choice%"=="1" (
    echo Starting Live Desktop Webcam AI Detector...
    cd /d "%~dp0"
    python scripts\run_face_detection.py
    pause
    exit /b
)

if "%choice%"=="2" (
    echo Ensuring backend & frontend are running...
    cd /d "%~dp0"
    start "1. Kumbh Backend Server" cmd /k "title Kumbh Backend Server && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload"
    timeout /t 2 /nobreak >nul
    start "2. Kumbh Authority Dashboard" cmd /k "cd authority-dashboard && npm run dev"
    timeout /t 3 /nobreak >nul
    start http://localhost:5173/face-detection
    echo Opening Web AI Studio in browser...
    pause
    exit /b
)

if "%choice%"=="3" (
    echo Launching full system...
    cd /d "%~dp0"
    start "1. Kumbh Backend Server" cmd /k "title Kumbh Backend Server && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload"
    timeout /t 2 /nobreak >nul
    start "2. Kumbh Authority Dashboard" cmd /k "cd authority-dashboard && npm run dev"
    timeout /t 3 /nobreak >nul
    start http://localhost:5173/face-detection
    python scripts\run_face_detection.py
    pause
    exit /b
)

if "%choice%"=="4" (
    echo Launching Combined AI (Face Detection + People Counting)...
    cd /d "%~dp0"
    python scripts\run_combined_detection.py
    pause
    exit /b
)
