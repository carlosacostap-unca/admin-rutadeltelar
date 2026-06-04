import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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
const planPath = process.env.MEDIA_MIGRATION_PLAN_PATH || findLatestMigrationPlanPath();
const collectionFilter = process.env.MEDIA_MIGRATION_COLLECTION || '';
const recordLimit = Number(process.env.MEDIA_MIGRATION_RECORD_LIMIT || 5);
const fileLimit = Number(process.env.MEDIA_MIGRATION_FILE_LIMIT || 0);
const apply = process.env.MEDIA_MIGRATION_APPLY === 'true';
const generatedAt = new Date().toISOString();

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

if (!planPath || !existsSync(planPath)) {
  throw new Error('Missing media migration plan. Run npm run media:migration-plan first or set MEDIA_MIGRATION_PLAN_PATH.');
}

const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const token = await authenticate();
const selectedPlans = [];
let selectedFiles = 0;

for (const recordPlan of plan.recordPlans) {
  if (collectionFilter && recordPlan.collection !== collectionFilter) continue;
  if (recordLimit > 0 && selectedPlans.length >= recordLimit) break;
  if (fileLimit > 0 && selectedFiles >= fileLimit) break;

  const before = await pbJson(`/api/collections/${encodeURIComponent(recordPlan.collection)}/records/${encodeURIComponent(recordPlan.recordId)}`);
  const beforeOptimized = normalizeFilenames(before.media_optimizados);
  const beforeMap = isObject(before.media_optimizados_map) ? before.media_optimizados_map : {};
  const pendingUploads = recordPlan.uploads
    .filter((upload) => !isAlreadyMapped(beforeMap, beforeOptimized, upload))
    .slice(0, fileLimit > 0 ? Math.max(0, fileLimit - selectedFiles) : undefined);

  if (pendingUploads.length === 0) continue;
  selectedFiles += pendingUploads.length;
  selectedPlans.push({ recordPlan, beforeOptimized, beforeMap, pendingUploads });
}

const dryRunResult = {
  ok: true,
  mode: apply ? 'apply' : 'dry-run',
  generatedAt,
  planPath,
  collectionFilter: collectionFilter || null,
  limits: {
    recordLimit,
    fileLimit,
  },
  originalFieldsRemainUntouched: true,
  selectedRecords: selectedPlans.length,
  selectedFiles,
  selected: selectedPlans.map(({ recordPlan, pendingUploads }) => ({
    collection: recordPlan.collection,
    recordId: recordPlan.recordId,
    recordLabel: recordPlan.recordLabel,
    uploads: pendingUploads.map((upload) => ({
      originalField: upload.originalField,
      originalFilename: upload.originalFilename,
      plannedUploadName: upload.plannedOptimizedFilename,
      originalMB: upload.originalMB,
      optimizedMB: upload.optimizedMB,
      savingsMB: upload.savingsMB,
      mapKey: `${upload.originalField}:${upload.originalFilename}`,
    })),
  })),
};

if (!apply) {
  console.log(JSON.stringify(dryRunResult, null, 2));
  process.exit(0);
}

const applied = [];

for (const { recordPlan, beforeOptimized, beforeMap, pendingUploads } of selectedPlans) {
  const uploadForm = new FormData();
  for (const upload of pendingUploads) {
    if (!existsSync(upload.sourceSamplePath)) {
      throw new Error(`Missing optimized sample: ${upload.sourceSamplePath}`);
    }
    const fileBytes = readFileSync(upload.sourceSamplePath);
    const file = new File([fileBytes], upload.plannedOptimizedFilename, { type: 'image/webp' });
    uploadForm.append('media_optimizados+', file);
  }

  const afterUpload = await pbJson(
    `/api/collections/${encodeURIComponent(recordPlan.collection)}/records/${encodeURIComponent(recordPlan.recordId)}`,
    { method: 'PATCH', body: uploadForm }
  );

  const afterOptimized = normalizeFilenames(afterUpload.media_optimizados);
  const newlyUploaded = afterOptimized.filter((filename) => !beforeOptimized.includes(filename));

  if (newlyUploaded.length !== pendingUploads.length) {
    throw new Error(`Expected ${pendingUploads.length} new optimized files for ${recordPlan.collection}/${recordPlan.recordId}, got ${newlyUploaded.length}.`);
  }

  const nextMap = { ...beforeMap };
  const appliedUploads = pendingUploads.map((upload, index) => {
    const actualFilename = newlyUploaded[index];
    const mapKey = `${upload.originalField}:${upload.originalFilename}`;
    nextMap[mapKey] = actualFilename;
    return {
      originalField: upload.originalField,
      originalFilename: upload.originalFilename,
      uploadedFilename: actualFilename,
      originalMB: upload.originalMB,
      optimizedMB: upload.optimizedMB,
      savingsMB: upload.savingsMB,
      mapKey,
    };
  });

  const mapForm = new FormData();
  mapForm.append('media_optimizados_map', JSON.stringify(nextMap));
  const afterMap = await pbJson(
    `/api/collections/${encodeURIComponent(recordPlan.collection)}/records/${encodeURIComponent(recordPlan.recordId)}`,
    { method: 'PATCH', body: mapForm }
  );

  applied.push({
    collection: recordPlan.collection,
    recordId: recordPlan.recordId,
    recordLabel: recordPlan.recordLabel,
    mediaOptimizadosCountBefore: beforeOptimized.length,
    mediaOptimizadosCountAfter: normalizeFilenames(afterMap.media_optimizados).length,
    appliedUploads,
  });
}

const result = {
  ...dryRunResult,
  applied,
  note: 'Original file fields were not modified. Only media_optimizados and media_optimizados_map were updated.',
};

const resultPath = join('reports', `media-batch-${generatedAt.replace(/[:.]/g, '-')}.json`);
writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify({ ...result, resultPath }, null, 2));

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

async function pbJson(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${pbUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`PocketBase ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function findLatestMigrationPlanPath() {
  const reportsDir = 'reports';
  if (!existsSync(reportsDir)) return null;
  return readdirSync(reportsDir)
    .filter((name) => /^media-migration-plan-.*\.json$/.test(name))
    .map((name) => ({ path: join(reportsDir, name), mtime: statSync(join(reportsDir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0]?.path || null;
}

function isAlreadyMapped(map, optimizedFiles, upload) {
  const mapped = map[`${upload.originalField}:${upload.originalFilename}`];
  return Boolean(mapped && optimizedFiles.includes(mapped));
}

function normalizeFilenames(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
