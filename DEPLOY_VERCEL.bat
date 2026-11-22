@echo off
title Deploy Love8 Ultra to Vercel
echo ========================================================
echo        DEPLOY LOVE8 ULTRA TO VERCEL (FREE HOSTING)
echo ========================================================
echo.
echo [1/2] Building production bundle...
cd /d "%~dp0"
call npm.cmd run build

echo.
echo [2/2] Deploying to Vercel Cloud...
echo (If this is your first time, Vercel will open browser for 1-click login)
npx.cmd vercel --prod

echo.
echo Deployment Complete!
pause
