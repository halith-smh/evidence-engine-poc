@echo off
echo ============================================================
echo    Chain of Custody - Windows Native Startup
echo ============================================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB service...
sc query MongoDB | find "RUNNING" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] MongoDB is not running!
    echo Starting MongoDB service...
    net start MongoDB
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to start MongoDB. Please start it manually.
        pause
        exit /b 1
    )
)
echo [OK] MongoDB is running
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing backend dependencies...
    call npm install
)

if not exist "frontend\node_modules\" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ============================================================
echo Starting Backend Server...
echo ============================================================
echo.

REM Start backend in a new window
start "Backend Server" cmd /k "npm start"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo Starting Frontend Application...
echo ============================================================
echo.

REM Start frontend in a new window
start "Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo [SUCCESS] All services started!
echo ============================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: Don't forget to request an airdrop!
echo.
echo In a new terminal, run:
echo   curl -X POST http://localhost:5000/request-airdrop -H "Content-Type: application/json" -d "{\"amount\": 2}"
echo.
echo Or in PowerShell:
echo   Invoke-RestMethod -Uri "http://localhost:5000/request-airdrop" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"amount": 2}'
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Application opened in browser!
echo Keep the Backend and Frontend windows open.
echo.
pause
