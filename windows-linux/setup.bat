@echo off
title Eclipse Client Setup
echo ============================================
echo         ECLIPSE CLIENT - WINDOWS SETUP
echo ============================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download it from: https://nodejs.org
    echo Install the LTS version, then run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

:: Navigate to project root
cd /d "%~dp0.."

:: Install dependencies
echo [INSTALLING] Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed!
echo.

:: Build frontend
echo [BUILDING] Frontend...
call npx vite build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)
echo.

:: Build Windows exe
echo [BUILDING] Windows executable...
call npx electron-builder --win portable
if %errorlevel% neq 0 (
    echo [ERROR] Executable build failed.
    pause
    exit /b 1
)
echo.

:: Move exe to windows-linux folder
echo [MOVING] Executable to windows-linux folder...
for %%f in (dist\*.exe) do (
    copy "%%f" "windows-linux\%%~nxf" >nul
    echo Copied: %%~nxf
)

echo.
echo ============================================
echo   BUILD COMPLETE! Your .exe is in the
echo   windows-linux folder. Double-click it
echo   to launch Eclipse Client.
echo ============================================
pause
