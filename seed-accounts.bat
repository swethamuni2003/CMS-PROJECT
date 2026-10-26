@echo off
title Seed TMS Accounts
set "PATH=%~dp0node-v20.18.0-win-x64;%PATH%"
cd /d "%~dp0backend"
echo ===========================================
echo Creating default Admin, User, and Staff accounts...
echo ===========================================
node seed-users.js
pause
