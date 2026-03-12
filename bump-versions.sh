#!/bin/bash
cd /Users/lucascairns/briu-website

# Bump versions in HTML files
for file in why-now-economics/index.html privacy/index.html admin/index.html services/index.html 404.html chart-preview.html build/*/index.html; do
  if [ -f "$file" ]; then
    sed -i '' 's/v=20260311a/v=20260311b/g' "$file"
    sed -i '' 's/v=20260311c/v=20260311d/g' "$file"
  fi
done

echo "✓ Cache-bust versions bumped"
