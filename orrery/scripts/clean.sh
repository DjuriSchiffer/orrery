#!/bin/bash

echo "🧹 Clearing caches..."

rm -rf node_modules/.vite
rm -rf tsconfig.tsbuildinfo
rm -rf dist
rm -rf .cache

echo "✅ Done! Run 'npm run dev' to restart."
