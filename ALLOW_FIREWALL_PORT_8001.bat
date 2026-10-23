@echo off
title Allow Port 8001 in Windows Firewall
echo ===================================================================
echo   Requesting Administrator Permission to Allow Port 8001...
echo ===================================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command try { if (Get-NetFirewallRule -DisplayName ''Kumbh Backend 8001'' -ErrorAction SilentlyContinue) { Set-NetFirewallRule -DisplayName ''Kumbh Backend 8001'' -Enabled True } else { New-NetFirewallRule -DisplayName ''Kumbh Backend 8001'' -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow } ; Write-Host ''`n[SUCCESS] Port 8001 is now allowed through Windows Firewall! Press Enter to close.''; Read-Host } catch { Write-Host ''`n[ERROR] '' $_.Exception.Message; Read-Host }'"
echo.
pause
