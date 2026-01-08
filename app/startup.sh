#!/bin/bash

# --- Indító Szkript ---
# A szerver leállítása: ENTER megnyomásával.

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
NC='\033[0m'

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}A Webalkalmazás Indítása...${NC}"
echo -e "${CYAN}=====================================================${NC}"

# Backend beállítása
echo -e "\n${YELLOW}1. Backend beállítása (Python)...${NC}"

if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    
    if [ ! -d "venv" ]; then
        echo -e "${GREEN}Létrehozom a 'venv' virtuális környezetet...${NC}"
        python3 -m venv .venv
    fi

    # Virtuális környezet aktiválása
    source .venv/bin/activate
    echo -e "${GREEN}A 'venv' virtuális környezet aktiválva.${NC}"

    # Csomagok telepítése
    if [ -f "requirements.txt" ]; then
        echo -e "${GREEN}Telepítem a Python függőségeket (pip install -r requirements.txt)...${NC}"
        pip install -r requirements.txt
    else
        echo -e "${YELLOW}Figyelem: A 'requirements.txt' fájl nem található. Backend függőségek kihagyva.${NC}"
    fi

    # Szerver indítása
    echo -e "${YELLOW}2. Backend szerver indítása (uvicorn main:app)...${NC}"
    uvicorn main:app --reload &
    
    BACKEND_PID=$!
    echo -e "${GREEN}Backend elindult (PID: $BACKEND_PID).${NC}"

    cd ..
else
    echo -e "${YELLOW}Hiba: A '$BACKEND_DIR' mappa nem található. Backend indítása kihagyva.${NC}"
    BACKEND_PID=0
fi

# Frontend beállítása
echo -e "\n${YELLOW}3. Frontend beállítása (Node.js)...${NC}"

if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"

    # Függőségek telepítése
    if [ ! -d "node_modules" ]; then
        echo -e "${GREEN}Telepítem a Node.js függőségeket (npm install)...${NC}"
        npm install
    else
        echo -e "${GREEN}A 'node_modules' már létezik. Függőségtelepítés kihagyva.${NC}"
    fi

    #Frontend Szerver Indítása
    echo -e "${YELLOW}4. Frontend fejlesztői szerver indítása (npm run dev)...${NC}"
    npm run dev &

    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend elindult (PID: $FRONTEND_PID).${NC}"

    cd ..
else
    echo -e "${YELLOW}Hiba: A '$FRONTEND_DIR' mappa nem található. Frontend indítása kihagyva.${NC}"
    FRONTEND_PID=0
fi


# A szerverek leállítása
echo -e "\n${YELLOW}Nyomj ENTER-t a szerverek leállításához...${NC}"
read

echo -e "${YELLOW}Szerverek leállítása...${NC}"

if [ $BACKEND_PID -ne 0 ]; then
    kill $BACKEND_PID
    echo -e "${GREEN}Backend leállítva (PID: $BACKEND_PID).${NC}"
fi

if [ $FRONTEND_PID -ne 0 ]; then
    kill $FRONTEND_PID
    echo -e "${GREEN}Frontend leállítva (PID: $FRONTEND_PID).${NC}"
fi

echo -e "${CYAN}Minden szerver leállt.${NC}"
