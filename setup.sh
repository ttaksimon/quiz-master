#!/bin/bash

# QuizMaster Setup Script
# Automatikus setup a backend és frontend számára

set -e

echo "╔════════════════════════════════════════╗"
echo "║    QuizMaster Setup Script              ║"
echo "╚════════════════════════════════════════╝"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Backend setup
echo -e "\n${BLUE}=== BACKEND SETUP ===${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo "Virtual environment létrehozása..."
    python3 -m venv venv
fi

echo "Virtual environment aktiválása..."
source venv/bin/activate

echo "Dependencies telepítése..."
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Módosítsd a backend/.env fájlt a saját adatokkal!${NC}"
fi

cd ..

# Frontend setup
echo -e "\n${BLUE}=== FRONTEND SETUP ===${NC}"
cd frontend

echo "Dependencies telepítése..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Módosítsd a frontend/.env fájlt szükség szerint!${NC}"
fi

cd ..

echo -e "\n${GREEN}✓ Setup kész!${NC}"
echo -e "\nIndítás:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo -e "\n${YELLOW}Megjegyzés: Windows-on az aktiválás: venv\\Scripts\\activate${NC}"
