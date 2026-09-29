@echo off
title DrivePulse Backend - Spring Boot 3
cd /d "%~dp0backend"

echo ====================================================
echo   DrivePulse - Starting Spring Boot Backend (Java 23)
echo   MySQL Database: car_booking_db (Port 3306)
echo   API Port: http://localhost:8080
echo ====================================================
echo.

if exist "C:\Users\Akuthota\maven-3.9.9\bin\mvn.cmd" (
    "C:\Users\Akuthota\maven-3.9.9\bin\mvn.cmd" spring-boot:run
) else (
    call mvn spring-boot:run
)

pause
