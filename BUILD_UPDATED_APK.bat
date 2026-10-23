@echo off
title Build Updated Kumbh Sarthi APK
echo ===================================================================
echo     BUILDING UPDATED KUMBH SARTHI APK (FIREBASE + FULL SERVICES)
echo ===================================================================
echo.
cd /d "%~dp0"
echo [1/2] Bundling latest React Native app code...
call npx expo export:embed --platform android --dev false --entry-file node_modules/expo-router/entry.js --bundle-output dist_bundle/index.android.bundle --assets-dest dist_bundle/assets
echo.
echo [2/2] Packaging, aligning and signing APK...
python scripts\package_apk.py
echo.
if exist "KumbhSarthi_Updated.apk" (
    echo ===================================================================
    echo   BUILD SUCCESSFUL!
    echo   New APK ready at: KumbhSmartAssist\KumbhSarthi_Updated.apk
    echo   You can install this APK directly on your phone!
    echo ===================================================================
) else (
    echo Build failed. Check above logs for details.
)
pause
