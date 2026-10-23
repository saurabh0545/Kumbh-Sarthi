@echo off
title Kumbh Sarthi - Combined AI (Face Detection + People Count)
color 0B
echo ===================================================================
echo     KUMBH SARTHI - COMBINED AI SURVEILLANCE SYSTEM
echo ===================================================================
echo   Face Detection  : YuNet ONNX + SFace Biometric Recognition
echo   People Counting : YOLO v8/v11 Person Detector
echo   Both run on a SINGLE shared webcam feed simultaneously.
echo ===================================================================
echo.
echo   Press 'Q' inside the camera window to stop.
echo.
cd /d "%~dp0"
python scripts\run_combined_detection.py
pause
