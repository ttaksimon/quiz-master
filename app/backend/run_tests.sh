#!/bin/bash

# --- Backend Teszt Indító Script ---

cd "$(dirname "$0")"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== A Webalkalmazás Szerveroldal Tesztjei ===${NC}\n"

if ! command -v pytest &> /dev/null; then
    echo -e "${RED}pytest nincs telepítve!${NC}"
    echo "Telepítés: pip install pytest httpx pytest-cov"
    exit 1
fi

case "$1" in
    "auth")
        echo -e "${GREEN}Authentication tesztek futtatása...${NC}"
        pytest tests/test_auth.py -v
        ;;
    "quiz")
        echo -e "${GREEN}Quiz tesztek futtatása...${NC}"
        pytest tests/test_quiz.py -v
        ;;
    "game")
        echo -e "${GREEN}Game tesztek futtatása...${NC}"
        pytest tests/test_game.py -v
        ;;
    "coverage")
        echo -e "${GREEN}Tesztek futtatása lefedettségi riporttal...${NC}"
        pytest --cov=. --cov-report=html --cov-report=term
        echo -e "\n${BLUE}HTML riport: htmlcov/index.html${NC}"
        ;;
    "quick")
        echo -e "${GREEN}Gyors tesztek (párhuzamos)...${NC}"
        pytest -n auto -q
        ;;
    "verbose")
        echo -e "${GREEN}Részletes tesztek...${NC}"
        pytest -vv
        ;;
    "failed")
        echo -e "${GREEN}Csak a sikertelen tesztek újrafuttatása...${NC}"
        pytest --lf -v
        ;;
    *)
        echo -e "${GREEN}Összes teszt futtatása...${NC}"
        pytest -v
        ;;
esac

echo -e "\n${BLUE}=== Tesztek befejezve ===${NC}"
