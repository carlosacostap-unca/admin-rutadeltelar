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
const collectionName = process.env.POCKETBASE_COLLECTION_METRICS_VIEWS || 'metricas_visitas';
const dryRun = process.argv.includes('--dry-run');

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

const desiredFields = [
  selectField('entity_type', ['estaciones', 'actores', 'productos', 'experiencias', 'imperdibles'], true),
  textField('entity_id', { required: true, max: 80 }),
  textField('entity_slug', { required: true, max: 160 }),
  textField('entity_title', { required: true, max: 220 }),
  textField('path', { max: 240 }),
  dateField('viewed_at', true),
  textField('viewed_on', { required: true, max: 10 }),
  textField('visitor_hash', { required: true, max: 80 }),
  boolField('is_unique_daily'),
  textField('referrer_host', { max: 120 }),
];

const token = await authenticate();
const existing = await getCollection(collectionName);

if (!existing) {
  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      wouldCreate: true,
      collection: collectionName,
      fields: desiredFields.map((field) => field.name),
    }, null, 2));
    process.exit(0);
  }

  const created = await pb('/api/collections', {
    method: 'POST',
    body: JSON.stringify({
      name: collectionName,
      type: 'base',
      system: false,
      fields: desiredFields,
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
    }),
  });

  console.log(JSON.stringify({ ok: true, dryRun: false, created: true, collection: created.name }, null, 2));
} else {
  const fields = existing.fields || existing.schema || [];
  const fieldNames = new Set(fields.map((field) => field.name));
  const missingFields = desiredFields.filter((field) => !fieldNames.has(field.name));
  const patch = {};

  if (missingFields.length > 0) {
    patch.fields = [...fields, ...missingFields];
  }

  if (existing.listRule !== '@request.auth.id != ""') patch.listRule = '@request.auth.id != ""';
  if (existing.viewRule !== '@request.auth.id != ""') patch.viewRule = '@request.auth.id != ""';
  if (existing.createRule !== null) patch.createRule = null;
  if (existing.updateRule !== null) patch.updateRule = null;
  if (existing.deleteRule !== null) patch.deleteRule = null;

  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      wouldCreate: false,
      collection: collectionName,
      wouldAddFields: missingFields.map((field) => field.name),
      wouldUpdateRules: Object.keys(patch).some((key) => key.endsWith('Rule')),
    }, null, 2));
    process.exit(0);
  }

  if (Object.keys(patch).length > 0) {
    await pb(`/api/collections/${encodeURIComponent(collectionName)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  console.log(JSON.stringify({
    ok: true,
    dryRun: false,
    created: false,
    collection: collectionName,
    addedFields: missingFields.map((field) => field.name),
    rulesUpdated: Object.keys(patch).some((key) => key.endsWith('Rule')),
  }, null, 2));
}

async function getCollection(name) {
  const response = await fetch(`${pbUrl}/api/collections/${encodeURIComponent(name)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`PocketBase ${response.status}: ${await response.text()}`);
  }

  return response.json();
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

function baseField(name, type, required = false) {
  return {
    name,
    type,
    required,
    presentable: false,
    hidden: false,
    system: false,
  };
}

function textField(name, options = {}) {
  return {
    ...baseField(name, 'text', Boolean(options.required)),
    min: 0,
    max: options.max ?? 0,
    pattern: '',
    autogeneratePattern: '',
    primaryKey: false,
  };
}

function selectField(name, values, required = false) {
  return {
    ...baseField(name, 'select', required),
    maxSelect: 1,
    values,
  };
}

function dateField(name, required = false) {
  return {
    ...baseField(name, 'date', required),
    min: '',
    max: '',
  };
}

function boolField(name) {
  return baseField(name, 'bool', false);
}
