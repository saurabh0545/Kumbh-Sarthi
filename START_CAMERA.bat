@echo off
title Kumbh Sarthi - Gate 1 Live Crowd Camera Detector
echo ===================================================
echo   Starting Gate 1 Live YOLO Camera Detector
echo   Backend Target: http://localhost:8001/api/crowd/update
echo   Press 'q' inside the webcam window to stop.
echo ===================================================
cd /d "%~dp0"
python scripts\run_crowd_detection.py
pause
