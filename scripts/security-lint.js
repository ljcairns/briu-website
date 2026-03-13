#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'scripts', 'dist']);

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name) && dir === ROOT) continue;
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (/\.(html|js)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const findings = { HIGH: [], MEDIUM: [], LOW: [] };

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const ext = path.extname(filePath);
  const relPath = rel(filePath);

  lines.forEach((line, i) => {
    const lineNum = i + 1;

    // Skip lines with security-lint-disable comment
    if (/security-lint-disable/.test(line)) return;

    // HIGH: innerHTML with dynamic user input (variable from external source)
    // MEDIUM: innerHTML with template literals / string concat (likely trusted but review)
    if (/\.innerHTML\s*=/.test(line)) {
      if (!/DOMPurify\.sanitize|escapeHtml|sanitize\(/.test(line)) {
        // Flag as HIGH if line references user-controlled sources
        if (/\.(value|search|hash|href|pathname|textContent)\b/.test(line) ||
            /location\.|URL\(|searchParams|formData|querySelector.*\.value/.test(line) ||
            /JSON\.parse\(.*response/.test(line)) {
          findings.HIGH.push(`${relPath}:${lineNum} - innerHTML with potentially untrusted input`);
        } else {
          findings.MEDIUM.push(`${relPath}:${lineNum} - innerHTML assignment without sanitize/escape call`);
        }
      }
    }

    // HIGH: Formspree placeholder endpoints
    if (/formspree\.io/i.test(line)) {
      if (/YOUR_FORM_ID|xyzabc|placeholder/i.test(line) ||
          /<[^>]+>/.test(line.match(/formspree\.io\/f\/([^\s"']+)/)?.[1] || '') ||
          /formspree\.io\/f\/[A-Z_]{4,}/.test(line)) {
        findings.HIGH.push(`${relPath}:${lineNum} - Formspree placeholder/template endpoint detected`);
      }
    }

    // MEDIUM: Hardcoded internal paths
    if (/\/home\/[a-z]+\//i.test(line) || /\/Users\/[A-Za-z]+\//.test(line)) {
      findings.MEDIUM.push(`${relPath}:${lineNum} - Hardcoded internal path`);
    }

    // MEDIUM: Hardcoded private IP addresses
    if (/\b(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)\b/.test(line)) {
      // Skip comments referencing localhost in documentation contexts
      findings.MEDIUM.push(`${relPath}:${lineNum} - Hardcoded private IP or localhost`);
    }

    // LOW: console.log in .js files
    if (ext === '.js' && /console\.log\(/.test(line)) {
      findings.LOW.push(`${relPath}:${lineNum} - console.log statement`);
    }
  });
}

function checkPermissions(filePath) {
  // MEDIUM: file permissions > 644 for non-executable files
  if (/\.(html|css|js)$/.test(filePath)) {
    const relPath = rel(filePath);
    // Skip scripts/ directory
    if (relPath.startsWith('scripts')) return;
    try {
      const stat = fs.statSync(filePath);
      const mode = stat.mode & 0o777;
      if (mode > 0o644) {
        findings.MEDIUM.push(`${relPath} - File permissions ${mode.toString(8)} exceed 644`);
      }
    } catch (e) {
      // skip unreadable files
    }
  }
}

// Also walk for .css files for permission checks
function walkAll(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name) && dir === ROOT) continue;
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkAll(fullPath));
    } else if (/\.(html|css|js)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Scan .html and .js files for content issues
const files = walkDir(ROOT);
files.forEach(scanFile);

// Check permissions on all .html, .css, .js files
const allFiles = walkAll(ROOT);
allFiles.forEach(checkPermissions);

// Output
const severities = ['HIGH', 'MEDIUM', 'LOW'];
for (const sev of severities) {
  if (findings[sev].length > 0) {
    console.log(`\n--- ${sev} ---`);
    findings[sev].forEach(f => console.log(`[${sev}] ${f}`));
  }
}

const h = findings.HIGH.length;
const m = findings.MEDIUM.length;
const l = findings.LOW.length;

console.log(`\n${h} HIGH, ${m} MEDIUM, ${l} LOW issues found.`);

if (h > 0) {
  console.log(`\nPUSH BLOCKED: Fix ${h} HIGH severity issues before pushing.`);
  process.exit(1);
}
