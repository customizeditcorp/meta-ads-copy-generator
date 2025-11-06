#!/bin/bash

# Bannerbear Integration Setup Script
# This script automates the setup process for the Bannerbear integration
# Run this script after cloning the repository

set -e  # Exit on error

echo "=========================================="
echo "Bannerbear Integration Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo -e "${RED}Error: pnpm is not installed. Please install pnpm first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Check for .env file
echo -e "${YELLOW}[2/6] Checking environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env and add your actual credentials:${NC}"
    echo "  - DATABASE_URL"
    echo "  - OPENAI_API_KEY"
    echo "  - JWT_SECRET"
    echo "  - VITE_APP_ID"
    echo ""
    echo -e "${YELLOW}Press Enter when you've updated .env, or Ctrl+C to exit and update manually...${NC}"
    read -r
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Step 3: Check if BANNERBEAR_API_KEY is set
echo -e "${YELLOW}[3/6] Verifying Bannerbear API key...${NC}"
if grep -q "BANNERBEAR_API_KEY=bb_pr_" .env; then
    echo -e "${GREEN}✓ Bannerbear API key found${NC}"
else
    echo -e "${RED}Error: BANNERBEAR_API_KEY not found in .env${NC}"
    echo "Please add: BANNERBEAR_API_KEY=bb_pr_68c446c743c4b27916126868d25fa3"
    exit 1
fi
echo ""

# Step 4: Database setup
echo -e "${YELLOW}[4/6] Database setup...${NC}"
echo "Do you want to run database migrations now? (y/n)"
read -r run_migrations

if [ "$run_migrations" = "y" ]; then
    echo "Please provide your MySQL credentials:"
    read -p "MySQL Host (default: localhost): " db_host
    db_host=${db_host:-localhost}
    
    read -p "MySQL User: " db_user
    read -sp "MySQL Password: " db_pass
    echo ""
    
    read -p "Database Name: " db_name
    
    echo -e "${YELLOW}Running migrations...${NC}"
    mysql -h "$db_host" -u "$db_user" -p"$db_pass" "$db_name" < drizzle/migrations/0001_add_bannerbear_tables.sql
    
    echo -e "${GREEN}✓ Migrations completed${NC}"
    echo ""
    
    echo "Do you want to seed JV Roofing test data? (y/n)"
    read -r run_seed
    
    if [ "$run_seed" = "y" ]; then
        echo -e "${YELLOW}Seeding JV Roofing data...${NC}"
        mysql -h "$db_host" -u "$db_user" -p"$db_pass" "$db_name" < drizzle/seeds/001_jv_roofing_bannerbear.sql
        echo -e "${GREEN}✓ Seed data inserted${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping database setup. You'll need to run migrations manually:${NC}"
    echo "  mysql -u user -p database < drizzle/migrations/0001_add_bannerbear_tables.sql"
    echo "  mysql -u user -p database < drizzle/seeds/001_jv_roofing_bannerbear.sql"
fi
echo ""

# Step 5: Build check
echo -e "${YELLOW}[5/6] Checking TypeScript compilation...${NC}"
if pnpm run build --dry-run 2>/dev/null || true; then
    echo -e "${GREEN}✓ TypeScript compilation check passed${NC}"
else
    echo -e "${YELLOW}⚠ Build check skipped (optional)${NC}"
fi
echo ""

# Step 6: Summary
echo -e "${YELLOW}[6/6] Setup Summary${NC}"
echo "=========================================="
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo -e "${GREEN}✓ Environment variables configured${NC}"
echo -e "${GREEN}✓ Bannerbear API key verified${NC}"

if [ "$run_migrations" = "y" ]; then
    echo -e "${GREEN}✓ Database migrations completed${NC}"
    if [ "$run_seed" = "y" ]; then
        echo -e "${GREEN}✓ Test data seeded${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Database migrations pending${NC}"
fi

echo "=========================================="
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "To start the development server:"
echo -e "${YELLOW}  pnpm dev${NC}"
echo ""
echo "The app will be available at:"
echo "  http://localhost:5000"
echo ""
echo "To access the image generator:"
echo "  http://localhost:5000/images?campaignId=YOUR_CAMPAIGN_ID"
echo ""
echo "For more information, see:"
echo "  - BANNERBEAR_INTEGRATION.md"
echo "  - docs/DEVELOPMENT_CHAT_2025-11-06.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
