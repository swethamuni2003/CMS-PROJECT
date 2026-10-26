@echo off
title TMS Backend Server
set "PATH=%~dp0node-v20.18.0-win-x64;%PATH%"
cd /d "%~dp0backend"
echo ===========================================
echo Starting Ticket Management System Backend...
echo Backend API running on http://localhost:5000
echo ===========================================
npm start
pause
