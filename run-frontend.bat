@echo off
title TMS Frontend App
set "PATH=%~dp0node-v20.18.0-win-x64;%PATH%"
cd /d "%~dp0frontend"
echo ===========================================
echo Starting Ticket Management System Frontend...
echo Application running on http://localhost:5173
echo ===========================================
npm run dev
pause
