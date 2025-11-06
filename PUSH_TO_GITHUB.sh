#!/bin/bash

# Script para hacer push de Bannerbear Integration a GitHub
# Ejecuta este script desde tu terminal local

echo "=========================================="
echo "Push Bannerbear Integration to GitHub"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paso 1: Clonar el repositorio (si no lo tienes)
echo -e "${YELLOW}[Paso 1/5] ¿Ya tienes el repositorio clonado? (y/n)${NC}"
read -r has_repo

if [ "$has_repo" != "y" ]; then
    echo -e "${YELLOW}Clonando repositorio...${NC}"
    git clone https://github.com/customizeditcorp/meta-ads-copy-generator.git
    cd meta-ads-copy-generator
else
    echo -e "${YELLOW}Por favor, navega a la carpeta del repositorio y ejecuta este script desde ahí.${NC}"
    echo "Presiona Enter cuando estés en la carpeta..."
    read -r
fi

# Paso 2: Verificar que estamos en el repo correcto
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: No estás en un repositorio Git.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Repositorio encontrado${NC}"
echo ""

# Paso 3: Descargar el patch
echo -e "${YELLOW}[Paso 2/5] Descargando cambios...${NC}"
echo "Por favor, descarga el archivo 'bannerbear-integration.patch' que te envié"
echo "y colócalo en esta carpeta: $(pwd)"
echo ""
echo "Presiona Enter cuando hayas descargado el archivo..."
read -r

if [ ! -f "bannerbear-integration.patch" ]; then
    echo -e "${RED}Error: No se encontró el archivo bannerbear-integration.patch${NC}"
    echo "Por favor, descárgalo y colócalo en esta carpeta."
    exit 1
fi

echo -e "${GREEN}✓ Archivo patch encontrado${NC}"
echo ""

# Paso 4: Crear rama y aplicar cambios
echo -e "${YELLOW}[Paso 3/5] Creando rama y aplicando cambios...${NC}"

# Asegurarse de estar en main
git checkout main
git pull origin main

# Crear nueva rama
git checkout -b feature/bannerbear-integration

# Aplicar patch
git am < bannerbear-integration.patch

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al aplicar el patch. Intentando método alternativo...${NC}"
    git am --abort
    git apply bannerbear-integration.patch
    git add -A
    git commit -m "feat: Complete Bannerbear integration for automated image generation"
fi

echo -e "${GREEN}✓ Cambios aplicados${NC}"
echo ""

# Paso 5: Push a GitHub
echo -e "${YELLOW}[Paso 4/5] Haciendo push a GitHub...${NC}"
git push origin feature/bannerbear-integration

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Push exitoso${NC}"
else
    echo -e "${RED}Error al hacer push. Por favor, verifica tus credenciales de GitHub.${NC}"
    exit 1
fi

echo ""

# Paso 6: Crear Pull Request
echo -e "${YELLOW}[Paso 5/5] ¿Quieres crear un Pull Request ahora? (y/n)${NC}"
read -r create_pr

if [ "$create_pr" = "y" ]; then
    if command -v gh &> /dev/null; then
        gh pr create --title "Bannerbear Integration" --body "Complete Bannerbear integration for automated image generation. Includes photo library, angle selection, and parallel image generation for 3 formats."
        echo -e "${GREEN}✓ Pull Request creado${NC}"
    else
        echo -e "${YELLOW}GitHub CLI no está instalado. Puedes crear el PR manualmente en:${NC}"
        echo "https://github.com/customizeditcorp/meta-ads-copy-generator/compare/feature/bannerbear-integration"
    fi
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✓ ¡Push completado exitosamente!"
echo "==========================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Ir a GitHub y hacer merge del Pull Request"
echo "2. Correr migraciones en tu base de datos"
echo "3. Agregar BANNERBEAR_API_KEY en Manus"
echo ""
echo "Para más información, ver: BANNERBEAR_INTEGRATION.md"
