#!/usr/bin/env bash
# Build script para Render
# Este script se ejecuta automáticamente durante el despliegue

set -o errexit  # Exit on error

echo "🔧 Installing dependencies..."
npm ci --only=production=false

echo "📦 Building application..."
npm run build

echo "✅ Build completed successfully!"
