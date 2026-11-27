#!/bin/bash

# Pulspia Monitoring Server - Stop Script
# This script stops the running monitoring server

cd "$(dirname "$0")"

# Check if PID file exists
if [ ! -f monitor.pid ]; then
    echo "❌ Monitoring server is not running (no PID file found)"
    exit 1
fi

PID=$(cat monitor.pid)

# Check if process is actually running
if ! ps -p $PID > /dev/null 2>&1; then
    echo "❌ Monitoring server is not running (PID $PID not found)"
    rm -f monitor.pid
    exit 1
fi

# Stop the server
echo "🛑 Stopping monitoring server (PID: $PID)..."
kill $PID

# Wait for process to stop
sleep 2

# Verify it stopped
if ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Process did not stop gracefully, forcing..."
    kill -9 $PID
    sleep 1
fi

# Clean up PID file
rm -f monitor.pid

echo "✅ Monitoring server stopped successfully"
