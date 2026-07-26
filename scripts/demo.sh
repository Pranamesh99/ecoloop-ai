#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=========================================================="
echo "    EcoLoop AI - Autonomous Building Optimization PoC     "
echo "=========================================================="
echo ""
echo "🚀 Booting the entire infrastructure via Docker Compose..."
echo ""

docker-compose up --build -d

echo ""
echo "✅ Backend Engine starting on http://localhost:8000"
echo "✅ MCP AI Agent Loop starting in the background"
echo "✅ Next.js Dashboard starting on http://localhost:3000"
echo ""
echo "Please wait 10-15 seconds for the Next.js server to fully compile."
echo "Then, open your browser and navigate to: http://localhost:3000"
echo ""
echo "To view the logs of the autonomous agent running the OODA loop:"
echo "    docker-compose logs -f mcp-agent"
echo ""
echo "To stop the demo:"
echo "    docker-compose down"
echo "=========================================================="
