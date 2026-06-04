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
const collectionName = 'departamentos';
const imageThumbs = ['320x0', '768x0', '1280x0', '1600x0'];
const imageMaxSize = 3 * 1024 * 1024;
const imageMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'image/avif',
  'image/svg+xml',
];

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

const token = await authenticate();
const collection = await pb(`/api/collections/${encodeURIComponent(collectionName)}`);
const fields = collection.fields || collection.schema || [];
const fieldNames = new Set(fields.map((field) => field.name));
const nextFields = [...fields];
const added = [];

if (!fieldNames.has('foto_portada')) {
  nextFields.push(fileField('foto_portada', 1));
  added.push('foto_portada');
} else if (ensureFileFieldConfig(nextFields.find((field) => field.name === 'foto_portada'))) {
  added.push('foto_portada:config');
}

if (added.length > 0) {
  await pb(`/api/collections/${encodeURIComponent(collectionName)}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: nextFields }),
  });
}

console.log(JSON.stringify({ ok: true, collection: collectionName, added, unchanged: added.length === 0 }, null, 2));

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

function fileField(name, maxSelect) {
  return {
    name,
    type: 'file',
    required: false,
    presentable: false,
    hidden: false,
    system: false,
    maxSelect,
    maxSize: imageMaxSize,
    mimeTypes: imageMimeTypes,
    thumbs: imageThumbs,
    protected: false,
  };
}

function ensureFileFieldConfig(field) {
  if (!field || field.type !== 'file') return false;
  let changed = false;
  const currentThumbs = Array.isArray(field.thumbs) ? field.thumbs : [];
  const hasSameThumbs =
    currentThumbs.length === imageThumbs.length &&
    imageThumbs.every((thumb) => currentThumbs.includes(thumb));

  if (!hasSameThumbs) {
    field.thumbs = imageThumbs;
    changed = true;
  }

  if (field.maxSize !== imageMaxSize) {
    field.maxSize = imageMaxSize;
    changed = true;
  }

  return changed;
}
