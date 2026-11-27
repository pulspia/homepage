#!/bin/bash

# Pulspia Monitoring Server - Start Script
# This script starts the monitoring server in the background

cd "$(dirname "$0")"

# Check if server is already running
if [ -f monitor.pid ]; then
    PID=$(cat monitor.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "❌ Monitoring server is already running (PID: $PID)"
        echo "   Use ./stop-monitor.sh to stop it first"
        exit 1
    else
        # PID file exists but process is not running, clean up
        rm -f monitor.pid
    fi
fi

# Start the monitoring server in background
echo "🚀 Starting monitoring server..."
nohup node monitor.js > monitor.log 2>&1 < /dev/null &
PID=$!

# Save PID to file
echo $PID > monitor.pid

# Wait a moment and check if it started successfully
sleep 2
if ps -p $PID > /dev/null 2>&1; then
    echo "✅ Monitoring server started successfully!"
    echo "   PID: $PID"
    echo "   Port: 8002"
    echo "   Log file: $(pwd)/monitor.log"
    echo ""
    echo "Commands:"
    echo "   - View logs: tail -f $(pwd)/monitor.log"
    echo "   - Stop server: ./stop-monitor.sh"
    echo "   - Check status: ./status-monitor.sh"
else
    echo "❌ Failed to start monitoring server"
    echo "   Check monitor.log for errors"
    rm -f monitor.pid
    exit 1
fi
