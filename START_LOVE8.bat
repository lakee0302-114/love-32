@echo off
title Love32 Ultra Launcher
echo ========================================================
echo       LOVE32 ULTRA - ONLINE CLOUD COUPLE APP
echo ========================================================
echo.
echo Starting frontend app and opening in browser...
cd /d "%~dp0"
cmd.exe /c "npm run dev -- --host 127.0.0.1 --open"
pause
