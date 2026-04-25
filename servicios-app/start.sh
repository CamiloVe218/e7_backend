#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Servicios App — Iniciando Sistema    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${YELLOW}→ Iniciando backend (puerto 4000)...${NC}"
cd backend && npm run start:dev &
BACKEND_PID=$!
cd ..

sleep 3

echo -e "${YELLOW}→ Iniciando frontend (puerto 3000)...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Sistema en ejecución${NC}"
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:4000/api${NC}"
echo ""
echo -e "Presiona ${YELLOW}Ctrl+C${NC} para detener"
echo ""

wait
