@echo off
title Kumbh Sarthi - Online Tunnel (HTTPS)
echo ===================================================
echo   Kumbh Sarthi Public HTTPS Tunnel
echo ===================================================
echo Fetching your tunnel password / endpoint IP...
for /f "delims=" %%i in ('curl -s https://loca.lt/mytunnelpassword') do set TUNNEL_PASSWORD=%%i
echo.
echo ===================================================
echo   Tunnel Password / IP: %TUNNEL_PASSWORD%
echo ===================================================
echo.
echo Starting localtunnel on port 8001...
echo Look for "your url is: https://..." below:
echo.
npx localtunnel --port 8001 --local-host 127.0.0.1
pause
