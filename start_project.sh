#!/bin/bash

# ==============================================
#    ORNIS WILDLIFE AUDIO SYSTEM - STARTUP (MAC)
# ==============================================

echo "=============================================="
echo "   ORNIS WILDLIFE AUDIO SYSTEM - STARTUP"
echo "=============================================="
echo ""

# Get the script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "[1/2] Starting Python FastAPI Backend..."
echo "      API will be available at: http://127.0.0.1:8000"
echo ""

# Launch backend in a new terminal window
# We exclude 'data' and 'models' from the auto-reloader to prevent high CPU usage.
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR' && source .venv/bin/activate && uvicorn src.api:app --reload --reload-exclude 'data/*' --reload-exclude 'models/*'\""

sleep 2

echo "[2/2] Starting React Vite Frontend..."
echo "      App will be available at: http://localhost:5173"
echo ""

# Launch frontend in a new terminal window
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/frontend' && npm run dev\""

echo ""
echo "============================================"
echo " Both services are starting up!"
echo " Backend : http://127.0.0.1:8000"
echo " Frontend: http://localhost:5173"
echo "============================================"
echo ""
echo "Press Ctrl+C in the newly opened windows to stop."
