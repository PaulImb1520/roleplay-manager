@echo off
REM start.bat — start the roleplay-manager app (Windows)
REM Usage: scripts\start.bat
setlocal enabledelayedexpansion

set FRONTEND_URL=http://localhost:4321
set FRONTEND_PORT=4321
set BACKEND_PORT=3001
set STARTUP_DELAY=4

REM Sanity check: are dependencies installed?
if not exist node_modules (
    echo [31mDependencies not installed. Run scripts\install.bat first.[0m
    exit /b 1
)
if not exist packages\backend\node_modules (
    echo [31mDependencies not installed. Run scripts\install.bat first.[0m
    exit /b 1
)

REM Open the browser after a short delay so the servers can come up.
start "" /min cmd /c "timeout /t %STARTUP_DELAY% /nobreak >nul && start "" %FRONTEND_URL%"

echo [34mStarting roleplay-manager ^(backend on :%BACKEND_PORT%, frontend on :%FRONTEND_PORT%^)[0m
echo [34mPress Ctrl+C to stop.[0m
echo.

REM Run pnpm dev in the foreground so the user sees logs and can Ctrl+C.
call pnpm dev
if errorlevel 1 (
    echo [31mpnpm dev failed.[0m
    exit /b 1
)

endlocal
