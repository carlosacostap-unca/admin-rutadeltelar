import { existsSync, readFileSync } from 'node:fs';

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
const imageThumbs = ['320x0', '768x0', '1280x0', '1600x0'];
const mediaCollections = ['estaciones', 'actores', 'productos', 'experiencias', 'imperdibles'];
const catalogCollections = ['departamentos'];
const pageSize = 100;

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

const token = await authenticate();
const results = [];

for (const collectionName of [...mediaCollections, ...catalogCollections]) {
  const fields = catalogCollections.includes(collectionName)
    ? ['foto_portada']
    : ['foto_portada', 'galeria_fotos', 'fotos'];
  const result = await prewarmCollection(collectionName, fields);
  results.push(result);
}

console.log(JSON.stringify({ ok: true, thumbs: imageThumbs, results }, null, 2));

async function prewarmCollection(collectionName, fileFields) {
  let page = 1;
  let records = 0;
  let files = 0;
  let requests = 0;
  let failures = 0;

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(pageSize),
      fields: ['id', ...fileFields].join(','),
    });
    const data = await pb(`/api/collections/${encodeURIComponent(collectionName)}/records?${params}`);

    for (const record of data.items || []) {
      records += 1;
      const filenames = getRecordFilenames(record, fileFields);
      files += filenames.length;

      for (const filename of filenames) {
        for (const thumb of imageThumbs) {
          requests += 1;
          const response = await fetch(buildFileUrl(collectionName, record.id, filename, thumb), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            failures += 1;
            console.warn(`${collectionName}/${record.id}/${filename}?thumb=${thumb} -> ${response.status}`);
          }
        }
      }
    }

    if (!data.items || data.items.length < pageSize) break;
    page += 1;
  }

  return { collection: collectionName, records, files, requests, failures };
}

function getRecordFilenames(record, fileFields) {
  const filenames = [];
  for (const field of fileFields) {
    const value = record[field];
    if (Array.isArray(value)) {
      filenames.push(...value.filter(Boolean));
    } else if (value) {
      filenames.push(value);
    }
  }
  return Array.from(new Set(filenames));
}

function buildFileUrl(collectionName, recordId, filename, thumb) {
  return `${pbUrl}/api/files/${encodeURIComponent(collectionName)}/${encodeURIComponent(recordId)}/${encodeURIComponent(filename)}?thumb=${encodeURIComponent(thumb)}`;
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
