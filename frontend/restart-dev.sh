#!/bin/bash
echo "🧹 Limpiando caché..."
rm -rf node_modules/.vite build .react-router
echo "✅ Caché limpiado"
echo "🚀 Iniciando servidor de desarrollo..."
npm run dev
