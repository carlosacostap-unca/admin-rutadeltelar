import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
const pageSize = 100;
const fileRequestConcurrency = 8;
const outputDir = 'reports';
const generatedAt = new Date().toISOString();
const safeTimestamp = generatedAt.replace(/[:.]/g, '-');
const jsonPath = join(outputDir, `media-inventory-${safeTimestamp}.json`);
const csvPath = join(outputDir, `media-inventory-${safeTimestamp}.csv`);

const collections = [
  { name: 'estaciones', fields: ['foto_portada', 'galeria_fotos', 'fotos'] },
  { name: 'actores', fields: ['foto_portada', 'galeria_fotos', 'fotos'] },
  { name: 'productos', fields: ['foto_portada', 'galeria_fotos', 'fotos'] },
  { name: 'experiencias', fields: ['foto_portada', 'galeria_fotos', 'fotos'] },
  { name: 'imperdibles', fields: ['foto_portada', 'galeria_fotos', 'fotos'] },
  { name: 'departamentos', fields: ['foto_portada'] },
];

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

const token = await authenticate();
const fileRefs = [];

for (const collection of collections) {
  await collectCollectionFileRefs(collection);
}

const files = await mapLimit(fileRefs, fileRequestConcurrency, async (fileRef) => {
  const size = await getRemoteFileSize(fileRef.url);
  return {
    ...fileRef,
    sizeBytes: size.sizeBytes,
    sizeMB: size.sizeBytes == null ? null : roundMb(size.sizeBytes),
    sizeSource: size.source,
    exceeds3MB: size.sizeBytes == null ? null : size.sizeBytes > 3 * 1024 * 1024,
    exceeds5MB: size.sizeBytes == null ? null : size.sizeBytes > 5 * 1024 * 1024,
    exceeds10MB: size.sizeBytes == null ? null : size.sizeBytes > 10 * 1024 * 1024,
    status: size.status,
  };
});
files.sort((a, b) => (b.sizeBytes ?? -1) - (a.sizeBytes ?? -1));

const summary = summarize(files);
const report = {
  ok: true,
  generatedAt,
  mode: 'read-only',
  note: 'This script does not update records and does not delete storage files.',
  summary,
  files,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(csvPath, toCsv(files), 'utf8');

console.log(JSON.stringify({ ok: true, generatedAt, summary, jsonPath, csvPath }, null, 2));

async function collectCollectionFileRefs(collection) {
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(pageSize),
      fields: ['id', 'nombre', 'titulo', 'name', ...collection.fields].join(','),
    });
    const data = await pb(`/api/collections/${encodeURIComponent(collection.name)}/records?${params}`);

    for (const record of data.items || []) {
      for (const fileRef of getRecordFileRefs(record, collection.fields)) {
        const url = buildFileUrl(collection.name, record.id, fileRef.filename);
        fileRefs.push({
          collection: collection.name,
          recordId: record.id,
          recordLabel: record.nombre || record.titulo || record.name || '',
          field: fileRef.field,
          filename: fileRef.filename,
          url,
        });
      }
    }

    if (!data.items || data.items.length < pageSize) break;
    page += 1;
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function getRecordFileRefs(record, fields) {
  const refs = [];
  for (const field of fields) {
    const value = record[field];
    if (Array.isArray(value)) {
      for (const filename of value.filter(Boolean)) refs.push({ field, filename });
    } else if (value) {
      refs.push({ field, filename: value });
    }
  }
  return refs;
}

function buildFileUrl(collectionName, recordId, filename) {
  return `${pbUrl}/api/files/${encodeURIComponent(collectionName)}/${encodeURIComponent(recordId)}/${encodeURIComponent(filename)}`;
}

async function getRemoteFileSize(url) {
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const headResponse = await fetch(url, { method: 'HEAD', headers });
    const headSize = readContentLength(headResponse.headers);
    if (headResponse.ok && headSize != null) {
      return { sizeBytes: headSize, source: 'HEAD content-length', status: headResponse.status };
    }

    const rangeResponse = await fetch(url, { headers: { ...headers, Range: 'bytes=0-0' } });
    const rangeSize = readContentRangeSize(rangeResponse.headers) ?? readContentLength(rangeResponse.headers);
    return {
      sizeBytes: rangeResponse.ok || rangeResponse.status === 206 ? rangeSize : null,
      source: rangeSize == null ? 'unavailable' : 'range headers',
      status: rangeResponse.status,
    };
  } catch (error) {
    return {
      sizeBytes: null,
      source: error instanceof Error ? error.message : 'request failed',
      status: null,
    };
  }
}

function readContentLength(headers) {
  const value = headers.get('content-length');
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readContentRangeSize(headers) {
  const value = headers.get('content-range');
  if (!value) return null;
  const match = value.match(/\/(\d+)$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
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

async function pb(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${pbUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`PocketBase ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function summarize(items) {
  const known = items.filter((item) => item.sizeBytes != null);
  const totalBytes = known.reduce((sum, item) => sum + item.sizeBytes, 0);
  return {
    files: items.length,
    filesWithKnownSize: known.length,
    totalKnownMB: roundMb(totalBytes),
    over3MB: known.filter((item) => item.sizeBytes > 3 * 1024 * 1024).length,
    over5MB: known.filter((item) => item.sizeBytes > 5 * 1024 * 1024).length,
    over10MB: known.filter((item) => item.sizeBytes > 10 * 1024 * 1024).length,
    byCollection: summarizeByCollection(known),
  };
}

function summarizeByCollection(items) {
  return items.reduce((acc, item) => {
    acc[item.collection] ||= { files: 0, totalMB: 0, over3MB: 0, over5MB: 0, over10MB: 0 };
    acc[item.collection].files += 1;
    acc[item.collection].totalMB = roundMb(acc[item.collection].totalMB * 1024 * 1024 + item.sizeBytes);
    if (item.sizeBytes > 3 * 1024 * 1024) acc[item.collection].over3MB += 1;
    if (item.sizeBytes > 5 * 1024 * 1024) acc[item.collection].over5MB += 1;
    if (item.sizeBytes > 10 * 1024 * 1024) acc[item.collection].over10MB += 1;
    return acc;
  }, {});
}

function toCsv(items) {
  const headers = [
    'collection',
    'recordId',
    'recordLabel',
    'field',
    'filename',
    'sizeBytes',
    'sizeMB',
    'sizeSource',
    'exceeds3MB',
    'exceeds5MB',
    'exceeds10MB',
    'status',
    'url',
  ];
  return [headers.join(','), ...items.map((item) => headers.map((header) => csvValue(item[header])).join(','))].join('\n');
}

function csvValue(value) {
  if (value == null) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function roundMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}
