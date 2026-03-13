#!/usr/bin/env bash
# Minify all site JS files using terser, outputting to dist/ with preserved structure.
# Excludes: node_modules/, dist/, workers/, scripts/, and already-minified .min.js files.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
TERSER="$ROOT/node_modules/.bin/terser"

if [ ! -x "$TERSER" ]; then
  echo "Error: terser not found. Run 'npm install' first." >&2
  exit 1
fi

# Clean previous build
rm -rf "$DIST"

# Find JS files to minify (site assets only)
FILES=$(find "$ROOT" -name '*.js' \
  -not -path '*/node_modules/*' \
  -not -path '*/dist/*' \
  -not -path '*/workers/*' \
  -not -path '*/scripts/*' \
  -not -path '*/.wrangler/*' \
  -not -name '*.min.js')

COUNT=0
TOTAL_ORIG=0
TOTAL_MIN=0

for FILE in $FILES; do
  REL="${FILE#$ROOT/}"
  OUT="$DIST/$REL"
  mkdir -p "$(dirname "$OUT")"

  "$TERSER" "$FILE" --compress --mangle --output "$OUT"

  ORIG_SIZE=$(wc -c < "$FILE" | tr -d ' ')
  MIN_SIZE=$(wc -c < "$OUT" | tr -d ' ')
  SAVINGS=$(( ORIG_SIZE - MIN_SIZE ))
  if [ "$ORIG_SIZE" -gt 0 ]; then
    PCT=$(( SAVINGS * 100 / ORIG_SIZE ))
  else
    PCT=0
  fi

  printf "  %-40s %6d → %6d bytes (%d%% smaller)\n" "$REL" "$ORIG_SIZE" "$MIN_SIZE" "$PCT"
  TOTAL_ORIG=$(( TOTAL_ORIG + ORIG_SIZE ))
  TOTAL_MIN=$(( TOTAL_MIN + MIN_SIZE ))
  COUNT=$(( COUNT + 1 ))
done

TOTAL_SAVINGS=$(( TOTAL_ORIG - TOTAL_MIN ))
if [ "$TOTAL_ORIG" -gt 0 ]; then
  TOTAL_PCT=$(( TOTAL_SAVINGS * 100 / TOTAL_ORIG ))
else
  TOTAL_PCT=0
fi

echo ""
echo "Minified $COUNT files: $(( TOTAL_ORIG / 1024 ))KB → $(( TOTAL_MIN / 1024 ))KB ($TOTAL_PCT% reduction)"
