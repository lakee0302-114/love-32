@echo off
title Love8 Ultra Launcher
echo ========================================================
echo       LOVE8 ULTRA - ONLINE CLOUD COUPLE APP
echo ========================================================
echo.
echo Connected to Online Cloud Database (Firebase / Cloud Realtime)
echo Starting frontend app on http://localhost:5173/ ...
cd /d "%~dp0"
start "" "http://localhost:5173/"
npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
