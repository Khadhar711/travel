@echo off
title Discover Andhra Pradesh Tourism Portal
echo ====================================================
echo   Discover Andhra Pradesh - 1-Click Browser Launcher
echo ====================================================
echo Starting server and opening application in browser...
cd /d "%~dp0Discover-Andhra-Pradesh-main\Discover-Andhra-Pradesh-main"
start http://localhost:5000
node server/server.js
pause
