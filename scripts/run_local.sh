#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=========================================================="
echo "    EcoLoop AI - Local Run (No Docker)                    "
echo "=========================================================="
echo ""

# Setup Python Virtual Environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate

echo "Installing Simulation Engine dependencies..."
pip install -r simulation-engine/requirements.txt
echo "Installing Agent dependencies..."
pip install -r cognitive-agent/requirements.txt

# Stop background jobs on exit
trap 'kill $(jobs -p)' EXIT

echo ""
echo "🚀 Starting FastAPI Backend (Port 8000)..."
cd simulation-engine
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd ..

echo "🚀 Starting MCP Agent Loop..."
cd cognitive-agent
python -u src/agent.py &
cd ..

echo "🚀 Starting Next.js Frontend (Port 3000)..."
cd savings-dashboard
# Install node modules if missing
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
cd ..

echo ""
echo "✅ All services are starting locally!"
echo "Please wait 10-15 seconds for the Next.js server to fully compile."
echo "Then, open your browser and navigate to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services."
wait
