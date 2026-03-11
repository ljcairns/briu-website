#!/usr/bin/env node
/**
 * Generate embeddings via Cloudflare AI and upload to Vectorize.
 *
 * Prerequisites:
 *   1. Run `node scripts/ingest.js` first to generate chunks-texts.json
 *   2. Vectorize index "briu-content" must exist:
 *      wrangler vectorize create briu-content --dimensions=768 --metric=cosine
 *   3. CF_ACCOUNT_ID and CF_API_TOKEN env vars must be set
 *
 * Usage:
 *   CF_ACCOUNT_ID=xxx CF_API_TOKEN=xxx node scripts/embed-upload.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = import.meta.dirname;
const CHUNKS_FILE = join(SCRIPTS_DIR, 'chunks-texts.json');
const NDJSON_FILE = join(SCRIPTS_DIR, 'chunks.ndjson');
const VECTORS_FILE = join(SCRIPTS_DIR, 'vectors.ndjson');

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const INDEX_NAME = 'briu-content';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const BATCH_SIZE = 50; // Cloudflare AI embedding batch limit

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('Set CF_ACCOUNT_ID and CF_API_TOKEN environment variables.');
  console.error('Get these from: https://dash.cloudflare.com/ → Workers & Pages → API Tokens');
  process.exit(1);
}

if (!existsSync(CHUNKS_FILE)) {
  console.error('chunks-texts.json not found. Run `node scripts/ingest.js` first.');
  process.exit(1);
}

const chunks = JSON.parse(readFileSync(CHUNKS_FILE, 'utf-8'));
const ndjsonLines = readFileSync(NDJSON_FILE, 'utf-8').trim().split('\n').map(l => JSON.parse(l));

// Build lookup by ID
const metadataMap = {};
for (const line of ndjsonLines) {
  metadataMap[line.id] = line.metadata;
}

console.log(`Loaded ${chunks.length} chunks for embedding`);

async function generateEmbeddings(texts) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: texts }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (!data.success || !data.result?.data) {
    throw new Error('Embedding API returned no data: ' + JSON.stringify(data));
  }

  return data.result.data; // Array of float arrays
}

async function upsertVectors(vectors) {
  // Vectorize expects NDJSON: {"id": "...", "values": [...], "metadata": {...}}
  const ndjson = vectors.map(v => JSON.stringify(v)).join('\n');

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v2/indexes/${INDEX_NAME}/upsert`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/x-ndjson',
      },
      body: ndjson,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vectorize upsert error ${res.status}: ${err}`);
  }

  return await res.json();
}

async function main() {
  const allVectors = [];

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.text);

    console.log(`Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} (${batch.length} chunks)...`);

    const embeddings = await generateEmbeddings(texts);

    for (let j = 0; j < batch.length; j++) {
      allVectors.push({
        id: batch[j].id,
        values: embeddings[j],
        metadata: metadataMap[batch[j].id] || {},
      });
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\nGenerated ${allVectors.length} vectors`);

  // Save vectors locally for debugging
  writeFileSync(VECTORS_FILE, allVectors.map(v => JSON.stringify(v)).join('\n'));
  console.log(`Saved vectors to ${VECTORS_FILE}`);

  // Upload to Vectorize in batches of 100
  const UPLOAD_BATCH = 100;
  for (let i = 0; i < allVectors.length; i += UPLOAD_BATCH) {
    const batch = allVectors.slice(i, i + UPLOAD_BATCH);
    console.log(`Uploading batch ${Math.floor(i / UPLOAD_BATCH) + 1}/${Math.ceil(allVectors.length / UPLOAD_BATCH)}...`);

    const result = await upsertVectors(batch);
    console.log(`  Upserted: ${result.result?.count || batch.length} vectors`);

    if (i + UPLOAD_BATCH < allVectors.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\nDone! ${allVectors.length} vectors uploaded to Vectorize index "${INDEX_NAME}"`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
