# Build

## Prerequisites

```
npm install
```

## Minify JS

```
npm run build
```

This runs `scripts/build.js`, which minifies all site JS files with [terser](https://github.com/terser/terser) and outputs them to `dist/`, preserving directory structure. HTML pages reference the minified versions from `dist/`. Original source files are kept as-is.

The `dist/` directory is gitignored — run the build step after cloning or pulling.
