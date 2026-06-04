import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const envFile = '.env.local';

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ||= value;
  }
}

const pbUrl = (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || '').replace(/\/$/, '');
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
const minMb = Number(process.env.MEDIA_SHADOW_MIN_MB || 5);
const limit = Number(process.env.MEDIA_SHADOW_LIMIT || 0);
const concurrency = Number(process.env.MEDIA_SHADOW_CONCURRENCY || 4);
const maxDimension = Number(process.env.MEDIA_SHADOW_MAX_DIMENSION || 1920);
const targetBytes = Number(process.env.MEDIA_SHADOW_TARGET_MB || 2.5) * 1024 * 1024;
const inventoryPath = process.env.MEDIA_INVENTORY_PATH || findLatestInventoryPath();
const generatedAt = new Date().toISOString();
const safeTimestamp = generatedAt.replace(/[:.]/g, '-');
const outputDir = join('reports', `media-shadow-${safeTimestamp}`);
const jsonPath = join(outputDir, 'summary.json');
const csvPath = join(outputDir, 'summary.csv');
const samplesDir = join(outputDir, 'samples');

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

if (!inventoryPath || !existsSync(inventoryPath)) {
  throw new Error('Missing media inventory. Run npm run media:inventory first or set MEDIA_INVENTORY_PATH.');
}

const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const candidates = inventory.files
  .filter((file) => typeof file.sizeBytes === 'number' && file.sizeBytes > minMb * 1024 * 1024)
  .sort((a, b) => b.sizeBytes - a.sizeBytes)
  .slice(0, limit > 0 ? limit : undefined);

mkdirSync(samplesDir, { recursive: true });

const token = await authenticate();
const results = await mapLimit(candidates, concurrency, processCandidate);
const successful = results.filter((item) => item.status === 'optimized');
const summary = {
  ok: true,
  mode: 'shadow-read-only',
  generatedAt,
  inventoryPath,
  thresholdMB: minMb,
  candidates: candidates.length,
  optimized: successful.length,
  failed: results.length - successful.length,
  originalTotalMB: roundMb(sum(successful, 'originalBytes')),
  optimizedTotalMB: roundMb(sum(successful, 'optimizedBytes')),
  estimatedSavingsMB: roundMb(sum(successful, 'savingsBytes')),
  estimatedSavingsPercent: percent(sum(successful, 'savingsBytes'), sum(successful, 'originalBytes')),
  targetMB: roundMb(targetBytes),
  maxDimension,
  note: 'This script downloads originals and writes local optimized samples only. It does not update PocketBase records and does not delete storage files.',
};

const report = { ...summary, results };
writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(csvPath, toCsv(results), 'utf8');

console.log(JSON.stringify({ ...summary, jsonPath, csvPath, samplesDir }, null, 2));

async function processCandidate(file, index) {
  try {
    const original = await downloadFile(file.url);
    const optimized = await optimizeBuffer(original);
    const sampleFilename = `${String(index + 1).padStart(3, '0')}-${sanitizeFilename(file.collection)}-${sanitizeFilename(file.recordId)}-${sanitizeFilename(file.filename)}.webp`;
    const samplePath = join(samplesDir, sampleFilename);
    writeFileSync(samplePath, optimized);

    return {
      status: 'optimized',
      collection: file.collection,
      recordId: file.recordId,
      recordLabel: file.recordLabel,
      field: file.field,
      filename: file.filename,
      originalBytes: original.length,
      originalMB: roundMb(original.length),
      optimizedBytes: optimized.length,
      optimizedMB: roundMb(optimized.length),
      savingsBytes: Math.max(0, original.length - optimized.length),
      savingsMB: roundMb(Math.max(0, original.length - optimized.length)),
      savingsPercent: percent(Math.max(0, original.length - optimized.length), original.length),
      samplePath,
      sourceUrl: file.url,
    };
  } catch (error) {
    return {
      status: 'failed',
      collection: file.collection,
      recordId: file.recordId,
      recordLabel: file.recordLabel,
      field: file.field,
      filename: file.filename,
      originalBytes: file.sizeBytes,
      originalMB: file.sizeMB,
      error: error instanceof Error ? error.message : String(error),
      sourceUrl: file.url,
    };
  }
}

async function optimizeBuffer(buffer) {
  const base = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await base.metadata();
  const longestSide = Math.max(metadata.width || maxDimension, metadata.height || maxDimension);
  const resizeOptions = longestSide > maxDimension
    ? { width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true }
    : null;

  const qualities = [82, 76, 70, 64, 58];
  const resizeScales = [1, 0.85, 0.72, 0.6, 0.5];
  let best = null;

  for (const scale of resizeScales) {
    for (const quality of qualities) {
      let pipeline = sharp(buffer, { failOn: 'none' }).rotate();
      if (resizeOptions) {
        pipeline = pipeline.resize({
          width: Math.max(1, Math.round(resizeOptions.width * scale)),
          height: Math.max(1, Math.round(resizeOptions.height * scale)),
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const output = await pipeline.webp({ quality, effort: 4 }).toBuffer();
      if (!best || output.length < best.length) best = output;
      if (output.length <= targetBytes) return output;
    }
  }

  return best;
}

async function downloadFile(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${await response.text()}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function authenticate() {
  const body = JSON.stringify({ identity: adminEmail, password: adminPassword });
  const adminResponse = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (adminResponse.ok) return (await adminResponse.json()).token;

  const superuserResponse = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (superuserResponse.ok) return (await superuserResponse.json()).token;

  throw new Error(`PocketBase auth failed: admins=${adminResponse.status}, superusers=${superuserResponse.status}`);
}

async function mapLimit(items, limitSize, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limitSize, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function findLatestInventoryPath() {
  const reportsDir = 'reports';
  if (!existsSync(reportsDir)) return null;
  return readdirSync(reportsDir)
    .filter((name) => /^media-inventory-.*\.json$/.test(name))
    .map((name) => ({ name, path: join(reportsDir, name), mtime: statSync(join(reportsDir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0]?.path || null;
}

function toCsv(items) {
  const headers = [
    'status',
    'collection',
    'recordId',
    'recordLabel',
    'field',
    'filename',
    'originalMB',
    'optimizedMB',
    'savingsMB',
    'savingsPercent',
    'samplePath',
    'error',
    'sourceUrl',
  ];
  return [headers.join(','), ...items.map((item) => headers.map((header) => csvValue(item[header])).join(','))].join('\n');
}

function csvValue(value) {
  if (value == null) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function sanitizeFilename(value) {
  return String(value).replace(/[^a-z0-9._-]+/gi, '_').slice(0, 80);
}

function sum(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function roundMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 10000) / 100;
}
