@echo off
title DrivePulse Frontend - React + Vite
cd /d "%~dp0frontend"

echo ====================================================
echo   DrivePulse - Starting React Vite Frontend
echo   URL: http://localhost:5173
echo ====================================================
echo.

if not exist "node_modules\" (
    echo Installing dependencies, please wait...
    call npm install
)

call npm run dev

pause
