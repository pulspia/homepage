#!/bin/bash

# Pulspia Monitoring Server - Status Script
# This script checks the status of the monitoring server

cd "$(dirname "$0")"

echo "==================================="
echo "Monitoring Server Status"
echo "==================================="
echo ""

# Check if PID file exists
if [ ! -f monitor.pid ]; then
    echo "Status: ⭕ Not running (no PID file)"
    exit 0
fi

PID=$(cat monitor.pid)

# Check if process is running
if ps -p $PID > /dev/null 2>&1; then
    echo "Status: ✅ Running"
    echo "PID: $PID"
    echo "Port: 8002"
    echo "Log file: $(pwd)/monitor.log"
    echo ""

    # Check if server is responding
    if command -v curl &> /dev/null; then
        echo "Health Check:"
        HEALTH=$(curl -s http://localhost:8002/health 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "  ✅ Server is responding"
            echo "  Response: $HEALTH"
        else
            echo "  ⚠️  Server is not responding on port 8002"
        fi
    fi

    echo ""
    echo "Last 10 log lines:"
    echo "-----------------------------------"
    tail -n 10 monitor.log 2>/dev/null || echo "  (no logs available)"
else
    echo "Status: ❌ Not running (PID $PID not found)"
    echo "  PID file exists but process is not running"
    echo "  Run ./start-monitor.sh to start the server"
    rm -f monitor.pid
fi

echo ""
echo "==================================="
