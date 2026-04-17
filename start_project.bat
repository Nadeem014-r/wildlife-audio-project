@echo off
echo ==============================================
echo    ORNIS WILDLIFE AUDIO SYSTEM - STARTUP
echo ==============================================
echo.
echo [1/2] Starting Python FastAPI Backend...
echo       API will be available at: http://127.0.0.1:8000
echo.

:: Launch backend in the project root directory (IMPORTANT: uvicorn must run from here)
:: We exclude 'data' and 'models' from the auto-reloader to prevent high CPU usage.
start cmd /k "cd /d "%~dp0" && uvicorn src.api:app --reload --reload-exclude "data/*" --reload-exclude "models/*""

timeout /t 2 /nobreak > nul

echo [2/2] Starting React Vite Frontend...
echo       App will be available at: http://localhost:5173
echo.

:: Launch frontend
start cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================
echo  Both services are starting up!
echo  Backend : http://127.0.0.1:8000
echo  Frontend: http://localhost:5173
echo ============================================
echo.
pause
