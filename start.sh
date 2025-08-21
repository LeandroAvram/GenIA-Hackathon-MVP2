#!/bin/bash

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
cd backend && npm install

# Instalar dependencias del frontend
echo "Instalando dependencias del frontend..."
cd ../frontend && npm install

echo "Para ejecutar:"
echo "1. Backend NestJS: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"