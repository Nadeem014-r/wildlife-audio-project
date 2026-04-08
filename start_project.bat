@echo off
echo ==============================================
echo ORNIS WILDLIFE AUDIO SYSTEM - STARTUP SEQUENCE
echo ==============================================

echo [1/2] Starting Python FastAPI Backend Engine...
start cmd /k "uvicorn src.api:app --reload"

echo [2/2] Starting React Vite Frontend Service...
cd frontend
start cmd /k "npm run dev"

echo.
echo All services launched! 
echo The API is available at http://127.0.0.1:8000
echo The Database UI is available via Vite.
pause
