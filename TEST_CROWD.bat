@echo off
title Kumbh Sarthi - Live Crowd Test (Firebase Sync)
echo =========================================================
echo   Starting Live Crowd Detection Test
echo   Target: Gate 1 (Ramkund) - Gate-A
echo   Sync: Firebase Cloud Firestore (Direct Mobile App Sync)
echo   Press 'q' inside the webcam window to stop.
echo =========================================================
cd /d "%~dp0"
python backend\test_crowd.py
pause
