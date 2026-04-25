#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Servicios App — Setup Inicial        ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Se requiere Node.js 18 o superior (actual: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Verificar PostgreSQL o Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker disponible${NC}"
    echo -e "${YELLOW}→ Iniciando PostgreSQL con Docker...${NC}"
    docker-compose -f infrastructure/docker-compose.yml up -d postgres
    echo -e "${YELLOW}→ Esperando que PostgreSQL esté listo...${NC}"
    sleep 5
elif command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL instalado${NC}"
else
    echo -e "${RED}Error: Se requiere Docker o PostgreSQL instalado${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}--- Configurando Backend ---${NC}"

cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env creado${NC}"
fi

echo -e "${YELLOW}→ Instalando dependencias del backend...${NC}"
npm install

echo -e "${YELLOW}→ Generando cliente Prisma...${NC}"
npx prisma generate

echo -e "${YELLOW}→ Ejecutando migraciones...${NC}"
npx prisma migrate dev --name init --skip-seed 2>/dev/null || npx prisma db push

echo -e "${YELLOW}→ Ejecutando seed de datos...${NC}"
npx ts-node prisma/seed.ts

echo -e "${GREEN}✓ Backend configurado${NC}"
cd ..

echo ""
echo -e "${BLUE}--- Configurando Frontend ---${NC}"

cd frontend

if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local creado${NC}"
fi

echo -e "${YELLOW}→ Instalando dependencias del frontend...${NC}"
npm install

echo -e "${GREEN}✓ Frontend configurado${NC}"
cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ Setup completado exitosamente!    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Ejecuta ${YELLOW}./start.sh${NC} para iniciar el sistema"
echo ""
echo -e "Credenciales de prueba:"
echo -e "  ${BLUE}Admin:${NC}     admin@servicios.com     / admin123"
echo -e "  ${BLUE}Cliente:${NC}   cliente@demo.com        / cliente123"
echo -e "  ${BLUE}Proveedor:${NC} proveedor@demo.com      / proveedor123"
echo ""
