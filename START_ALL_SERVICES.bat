@echo off
title Kumbh Sarthi - Master System Launcher
color 0A
echo ===================================================================
echo             KUMBH SARTHI — MASTER SYSTEM LAUNCHER
echo ===================================================================
echo.
echo [1/3] Launching FastAPI Backend on Port 8001...
start "1. Kumbh Backend Server" cmd /k "cd /d %~dp0 && title Kumbh Backend Server && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Launching Online HTTPS Tunnel (localtunnel)...
start "2. Kumbh Online Tunnel" cmd /k "title Kumbh Online Tunnel && npx localtunnel --port 8001 --local-host 127.0.0.1"

echo.
echo ===================================================================
echo  Backend and Tunnel are now RUNNING!
echo  Check the Tunnel window for your "https://xxxx.loca.lt" URL.
echo.
echo  When you are ready to start the live YOLO Camera detector,
echo  press any key below...
echo ===================================================================
pause >nul

echo [3/3] Launching Live YOLO Webcam Camera Detector...
start "3. Kumbh YOLO Camera" cmd /k "cd /d %~dp0 && title Kumbh YOLO Camera && python scripts\run_crowd_detection.py"

echo.
echo All services launched successfully!
echo You can minimize this window.
timeout /t 5 >nul
