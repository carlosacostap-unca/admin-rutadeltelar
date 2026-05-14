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

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

const socialFields = ['facebook_url', 'instagram_url', 'pagina_web_url'];
const token = await authenticate();
const collectionName = 'actores';
const collection = await pb(`/api/collections/${encodeURIComponent(collectionName)}`);
const fields = collection.fields || collection.schema || [];
const fieldNames = new Set(fields.map((field) => field.name));
const nextFields = [...fields];
const added = [];

for (const fieldName of socialFields) {
  if (!fieldNames.has(fieldName)) {
    nextFields.push(urlField(fieldName));
    added.push(fieldName);
  }
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

function urlField(name) {
  return {
    name,
    type: 'url',
    required: false,
    presentable: false,
    hidden: false,
    system: false,
    exceptDomains: null,
    onlyDomains: null,
  };
}
