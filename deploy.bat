@echo off
REM Chain of Custody - Windows Deployment Script

setlocal enabledelayedexpansion

REM Colors (limited in CMD)
set "INFO=[INFO]"
set "SUCCESS=[OK]"
set "WARNING=[WARN]"
set "ERROR=[ERROR]"

echo.
echo ============================================================
echo         Chain of Custody - Tamper-Proof Sign-Off
echo            Deployment and Management Script
echo ============================================================
echo.

REM Parse command
set COMMAND=%1
set ARG=%2

if "%COMMAND%"=="" goto :show_help
if "%COMMAND%"=="start" goto :start_system
if "%COMMAND%"=="stop" goto :stop_system
if "%COMMAND%"=="restart" goto :restart_system
if "%COMMAND%"=="status" goto :check_status
if "%COMMAND%"=="logs" goto :view_logs
if "%COMMAND%"=="airdrop" goto :request_airdrop
if "%COMMAND%"=="test" goto :run_tests
if "%COMMAND%"=="clean" goto :clean_system
if "%COMMAND%"=="help" goto :show_help
goto :unknown_command

:start_system
echo %INFO% Starting Chain of Custody system...
docker-compose up --build -d
if %ERRORLEVEL% neq 0 (
    echo %ERROR% Failed to start containers
    exit /b 1
)
echo %SUCCESS% Containers started!
echo %INFO% Waiting for services to initialize...
timeout /t 10 /nobreak >nul

REM Check health
echo %INFO% Checking backend health...
curl -s http://localhost:5000/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo %SUCCESS% Backend is ready!
) else (
    echo %WARNING% Backend may still be starting...
)

echo.
echo %SUCCESS% System started successfully!
echo.
echo Access URLs:
echo    Frontend:     http://localhost:3000
echo    Backend:      http://localhost:5000
echo    Health Check: http://localhost:5000/health
echo.
echo %WARNING% IMPORTANT: Request an airdrop to enable blockchain features!
echo    Run: deploy.bat airdrop
echo.
goto :eof

:stop_system
echo %INFO% Stopping Chain of Custody system...
docker-compose down
echo %SUCCESS% System stopped
goto :eof

:restart_system
echo %INFO% Restarting Chain of Custody system...
docker-compose restart
echo %SUCCESS% System restarted
goto :eof

:check_status
echo %INFO% Checking system status...
echo.
echo Docker Containers:
docker-compose ps
echo.
echo Backend Health:
curl -s http://localhost:5000/health
echo.
echo Wallet Info:
curl -s http://localhost:5000/wallet-info
echo.
goto :eof

:view_logs
if "%ARG%"=="" (
    echo %INFO% Showing logs for all services...
    docker-compose logs -f
) else (
    echo %INFO% Showing logs for %ARG%...
    docker-compose logs -f %ARG%
)
goto :eof

:request_airdrop
set AMOUNT=%ARG%
if "%AMOUNT%"=="" set AMOUNT=2
echo %INFO% Requesting airdrop of %AMOUNT% SOL...

curl -s -X POST http://localhost:5000/request-airdrop -H "Content-Type: application/json" -d "{\"amount\": %AMOUNT%}"
echo.
if %ERRORLEVEL% equ 0 (
    echo %SUCCESS% Airdrop request sent!
) else (
    echo %ERROR% Airdrop failed
)
goto :eof

:run_tests
echo %INFO% Running basic tests...
echo.

echo Test 1: Health Check...
curl -s http://localhost:5000/health | findstr "healthy" >nul
if %ERRORLEVEL% equ 0 (
    echo %SUCCESS% PASS
) else (
    echo %ERROR% FAIL
)

echo Test 2: Wallet Info...
curl -s http://localhost:5000/wallet-info | findstr "address" >nul
if %ERRORLEVEL% equ 0 (
    echo %SUCCESS% PASS
) else (
    echo %ERROR% FAIL
)

echo Test 3: Get Requests...
curl -s http://localhost:5000/requests | findstr "[" >nul
if %ERRORLEVEL% equ 0 (
    echo %SUCCESS% PASS
) else (
    echo %ERROR% FAIL
)

echo.
echo %INFO% Basic tests completed
goto :eof

:clean_system
echo %WARNING% This will remove all containers, volumes, and uploaded files!
set /p CONFIRM="Are you sure? (Y/N): "
if /i "%CONFIRM%"=="Y" (
    echo %INFO% Cleaning system...
    docker-compose down -v
    if exist uploads rmdir /s /q uploads
    if exist wallet.json del wallet.json
    echo %SUCCESS% System cleaned
) else (
    echo %INFO% Cancelled
)
goto :eof

:show_help
echo Usage: deploy.bat [COMMAND] [OPTIONS]
echo.
echo Commands:
echo    start           Start the entire system
echo    stop            Stop all containers
echo    restart         Restart all containers
echo    status          Show system status
echo    logs [service]  Show logs (optionally for specific service)
echo    airdrop [amt]   Request SOL airdrop (default: 2 SOL)
echo    test            Run basic system tests
echo    clean           Remove all containers, volumes, and data
echo    help            Show this help message
echo.
echo Examples:
echo    deploy.bat start                Start the system
echo    deploy.bat airdrop 3            Request 3 SOL airdrop
echo    deploy.bat logs backend         Show backend logs
echo    deploy.bat status               Check system status
echo.
echo Services:
echo    - mongo          MongoDB database
echo    - backend        Node.js API server
echo    - frontend       React application
echo.
echo For detailed documentation, see:
echo    - README.md         Complete guide
echo    - QUICKSTART.md     5-minute setup
echo    - TESTING_GUIDE.md  Test scenarios
echo.
goto :eof

:unknown_command
echo %ERROR% Unknown command: %COMMAND%
echo.
goto :show_help
