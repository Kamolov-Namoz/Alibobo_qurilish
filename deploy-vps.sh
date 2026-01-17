#!/bin/bash
# VPS Deployment Script for Alibobo
# Run this script on VPS after uploading files

set -e

echo "🚀 Alibobo VPS Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Creating logs directory...${NC}"
mkdir -p logs
mkdir -p backend/uploads/products

echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install --production=false

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install --production=false
cd ..

echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

echo -e "${YELLOW}⚙️ Setting up PM2...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Stop existing process if running
pm2 delete alibobo-backend 2>/dev/null || true

echo -e "${YELLOW}🚀 Starting backend with PM2...${NC}"
pm2 start ecosystem.config.js --env production

echo -e "${YELLOW}💾 Saving PM2 process list...${NC}"
pm2 save

echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 Verification commands:"
echo "  - Check backend health: curl http://localhost:5000/api/health"
echo "  - View PM2 logs: pm2 logs alibobo-backend"
echo "  - Monitor PM2: pm2 monit"
echo ""
echo "🌐 Website should be available at: https://aliboboqurilish.uz"
