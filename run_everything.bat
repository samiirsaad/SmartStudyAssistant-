@echo off
echo ==========================================
echo       Smart Study Assistant Starter
echo ==========================================
echo.
echo [1/3] Cleaning up old stuck processes on ports 3000 and 5000...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :3000') DO taskkill /F /PID %%T >nul 2>&1
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5000') DO taskkill /F /PID %%T >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Starting Backend (Port 5000)...
cd /d C:\Users\a\SmartStudyAssistant\backend
start "SmartStudy Backend" cmd /k "node server.js"

echo [3/3] Starting Frontend (Port 3000)...
cd /d C:\Users\a\SmartStudyAssistant\frontend
start "SmartStudy Frontend" cmd /k "npm start"

echo.
echo ==========================================
echo DONE! Two new windows should have opened.
echo Please check your browser at http://localhost:3000
echo ==========================================
pause
