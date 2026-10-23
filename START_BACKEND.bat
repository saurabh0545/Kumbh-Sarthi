@echo off
title Kumbh Sarthi - FastAPI Backend Server
echo ===================================================
echo   Starting Kumbh Sarthi Backend (Port 8001)
echo   Laptop Hotspot URL: http://192.168.137.1:8001
echo ===================================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
pause
