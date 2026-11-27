#!/bin/bash

# Pulspia Homepage Deployment Script
# This script deploys the built application to /var/www/pulspia.com

set -e

DEPLOY_DIR="/var/www/pulspia.com"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="${PROJECT_DIR}/build"
SERVER_DIR="${PROJECT_DIR}/server"
ENV_FILE="${PROJECT_DIR}/.env"

echo "======================================"
echo "Pulspia Homepage Deployment"
echo "======================================"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found: $BUILD_DIR"
    echo "   Please run 'npm run build' first"
    exit 1
fi

echo "📦 Build directory: $BUILD_DIR"
echo "🎯 Deploy directory: $DEPLOY_DIR"
echo ""

# Backup existing files
if [ -d "$DEPLOY_DIR" ]; then
    echo "📂 Creating backup..."
    sudo cp -r "$DEPLOY_DIR" "${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup created"
    echo ""
fi

# Deploy build files (preserve services and backend directories)
echo "🚀 Deploying React build files..."
# Remove old homepage files but keep services, backend, and server directories
sudo find "${DEPLOY_DIR}" -maxdepth 1 -type f -delete
sudo rm -rf "${DEPLOY_DIR}/static" "${DEPLOY_DIR}/videos"
sudo cp -r "${BUILD_DIR}"/* "${DEPLOY_DIR}/"
echo "✅ React build files deployed"
echo ""

# Deploy server files
echo "🖥️  Deploying monitoring server..."
sudo mkdir -p "${DEPLOY_DIR}/server"
sudo cp "${SERVER_DIR}/monitor.js" "${DEPLOY_DIR}/server/"
sudo cp "${SERVER_DIR}/start-monitor.sh" "${DEPLOY_DIR}/server/"
sudo cp "${SERVER_DIR}/stop-monitor.sh" "${DEPLOY_DIR}/server/"
sudo cp "${SERVER_DIR}/status-monitor.sh" "${DEPLOY_DIR}/server/"
sudo cp "${SERVER_DIR}/package.json" "${DEPLOY_DIR}/server/" 2>/dev/null || true
sudo cp "${SERVER_DIR}/README.md" "${DEPLOY_DIR}/server/" 2>/dev/null || true

# Copy .env file
echo "🔧 Copying environment variables..."
sudo cp "${ENV_FILE}" "${DEPLOY_DIR}/" 2>/dev/null || echo "⚠️  No .env file found"
echo ""

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data "${DEPLOY_DIR}"
sudo chmod -R 755 "${DEPLOY_DIR}"
sudo chmod +x "${DEPLOY_DIR}/server"/*.sh
echo "✅ Permissions set"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd "${DEPLOY_DIR}/server"
sudo -u www-data npm install --production 2>/dev/null || sudo npm install --production
echo "✅ Dependencies installed"
echo ""

echo "======================================"
echo "✅ Deployment completed successfully!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start monitoring server:"
echo "   cd ${DEPLOY_DIR}/server && sudo -u www-data ./start-monitor.sh"
echo ""
echo "2. Access the site:"
echo "   http://pulspia.com (if nginx is configured)"
echo ""
echo "3. Check monitoring server status:"
echo "   cd ${DEPLOY_DIR}/server && ./status-monitor.sh"
echo ""
