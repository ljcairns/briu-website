#!/usr/bin/env node
// Minify all site JS files using terser, outputting to dist/ with preserved directory structure.
// Excludes: node_modules/, dist/, workers/, scripts/, .wrangler/, and *.min.js files.

const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const EXCLUDE_DIRS = new Set(['node_modules', 'dist', 'workers', 'scripts', '.wrangler', '.git']);

function collectJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
      results.push(full);
    }
  }
  return results;
}

async function build() {
  // Clean previous build
  fs.rmSync(DIST, { recursive: true, force: true });

  const files = collectJsFiles(ROOT);
  let totalOrig = 0;
  let totalMin = 0;

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const out = path.join(DIST, rel);

    fs.mkdirSync(path.dirname(out), { recursive: true });

    const source = fs.readFileSync(file, 'utf8');
    const result = await minify(source, { compress: true, mangle: true });

    if (result.code == null) {
      console.error(`  SKIP  ${rel} (terser returned no output)`);
      continue;
    }

    fs.writeFileSync(out, result.code);

    const origSize = Buffer.byteLength(source);
    const minSize = Buffer.byteLength(result.code);
    const pct = origSize > 0 ? Math.round((origSize - minSize) / origSize * 100) : 0;

    console.log(`  ${rel.padEnd(40)} ${String(origSize).padStart(6)} → ${String(minSize).padStart(6)} bytes (${pct}% smaller)`);
    totalOrig += origSize;
    totalMin += minSize;
  }

  const totalPct = totalOrig > 0 ? Math.round((totalOrig - totalMin) / totalOrig * 100) : 0;
  console.log();
  console.log(`Minified ${files.length} files: ${Math.round(totalOrig / 1024)}KB → ${Math.round(totalMin / 1024)}KB (${totalPct}% reduction)`);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
