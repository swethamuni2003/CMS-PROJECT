@echo off
title TMS React Native Mobile App
:: Check for system Node.js first; fallback to bundled node-v20.18.0
where node >nul 2>&1
if errorlevel 1 (
    set "PATH=%~dp0node-v20.18.0-win-x64;%PATH%"
) else (
    set "PATH=%PATH%;%~dp0node-v20.18.0-win-x64"
)
cd /d "%~dp0mobile"

echo ================================================================
echo      Ticket Management System (TMS) - React Native App
echo ================================================================
echo.
echo Choose how you would like to run the Mobile App:
echo.
echo   [1] Open in Web Browser (No phone needed - Instant preview)
echo   [2] Open in Expo Go on Phone (Fast / Cached Mode)
echo   [3] Open in Expo Go with Cloud Tunnel (If on Mobile Data / Campus Wi-Fi)
echo   [4] Clear Cache & Restart Expo Go (Use only if build fails)
echo.
echo   Manual Expo Go URL: exp://10.138.227.104:8081
echo ================================================================
echo.
set /p choice="Enter your choice (1, 2, 3, or 4) [Default 2]: "

if "%choice%"=="" set choice=2

if "%choice%"=="1" (
    echo.
    echo Starting Mobile App in Web Preview mode...
    echo Opening at http://localhost:8081
    echo.
    call npx expo start --web
) else if "%choice%"=="2" (
    echo.
    echo Starting Mobile App for Expo Go on Phone (Fast Mode)...
    echo.
    echo TIP: Ensure your phone is connected to the same Wi-Fi/Hotspot as your PC!
    echo.
    call npx expo start --go
) else if "%choice%"=="3" (
    echo.
    echo Starting Mobile App with Cloud Tunnel (Bypasses Wi-Fi restrictions)...
    echo.
    call npx expo start --go --tunnel
) else if "%choice%"=="4" (
    echo.
    echo Clearing Metro Cache and restarting...
    echo.
    call npx expo start --go -c
) else (
    echo Starting in Expo Go Fast Mode...
    call npx expo start --go
)

pause
