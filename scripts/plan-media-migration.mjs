import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const sourceSummaryPath = process.env.MEDIA_SHADOW_SUMMARY_PATH || findLatestShadowSummaryPath();
const limit = Number(process.env.MEDIA_MIGRATION_PLAN_LIMIT || 0);
const generatedAt = new Date().toISOString();
const safeTimestamp = generatedAt.replace(/[:.]/g, '-');
const outputDir = 'reports';
const jsonPath = join(outputDir, `media-migration-plan-${safeTimestamp}.json`);
const csvPath = join(outputDir, `media-migration-plan-${safeTimestamp}.csv`);

if (!sourceSummaryPath || !existsSync(sourceSummaryPath)) {
  throw new Error('Missing shadow optimization summary. Run npm run media:shadow-optimize first or set MEDIA_SHADOW_SUMMARY_PATH.');
}

const source = JSON.parse(readFileSync(sourceSummaryPath, 'utf8'));
const candidates = source.results
  .filter((item) => item.status === 'optimized' && item.samplePath && existsSync(item.samplePath))
  .sort((a, b) => b.savingsMB - a.savingsMB)
  .slice(0, limit > 0 ? limit : undefined);

const plansByRecord = new Map();

for (const item of candidates) {
  const recordKey = `${item.collection}:${item.recordId}`;
  const plan = plansByRecord.get(recordKey) || {
    collection: item.collection,
    recordId: item.recordId,
    recordLabel: item.recordLabel,
    uploads: [],
    mapEntries: [],
    originalFieldsRemainUntouched: true,
  };

  const plannedOptimizedFilename = buildOptimizedFilename(item);
  plan.uploads.push({
    sourceSamplePath: item.samplePath,
    targetField: 'media_optimizados+',
    plannedOptimizedFilename,
    originalField: item.field,
    originalFilename: item.filename,
    originalMB: item.originalMB,
    optimizedMB: item.optimizedMB,
    savingsMB: item.savingsMB,
    savingsPercent: item.savingsPercent,
  });
  plan.mapEntries.push({
    key: `${item.field}:${item.filename}`,
    value: plannedOptimizedFilename,
  });
  plansByRecord.set(recordKey, plan);
}

const recordPlans = Array.from(plansByRecord.values()).sort((a, b) => a.collection.localeCompare(b.collection) || a.recordLabel.localeCompare(b.recordLabel));
const affectedCollections = Array.from(new Set(recordPlans.map((plan) => plan.collection))).sort();

const plan = {
  ok: true,
  mode: 'dry-run',
  strategy: 'parallel-optimized-media-fields',
  generatedAt,
  sourceSummaryPath,
  note: 'This plan does not modify PocketBase and does not delete storage files. It avoids replacing/removing original file fields.',
  whyParallelFields: [
    'Removing or replacing files in PocketBase file fields can delete the previous storage object.',
    'The safe path is to keep foto_portada, galeria_fotos and fotos unchanged.',
    'Optimized files should be uploaded to media_optimizados and referenced from media_optimizados_map.',
    'The app can then prefer optimized files for display while originals remain attached to the record.',
  ],
  schemaPrerequisites: affectedCollections.map((collection) => ({
    collection,
    fieldsToEnsure: [
      {
        name: 'media_optimizados',
        type: 'file',
        maxSelect: 99,
        maxSize: 3 * 1024 * 1024,
        mimeTypes: ['image/webp'],
        thumbs: ['320x0', '768x0', '1280x0', '1600x0'],
      },
      {
        name: 'media_optimizados_map',
        type: 'json',
      },
    ],
  })),
  summary: {
    candidateFiles: candidates.length,
    affectedRecords: recordPlans.length,
    affectedCollections,
    originalTotalMB: round(sum(candidates, 'originalMB')),
    optimizedTotalMB: round(sum(candidates, 'optimizedMB')),
    estimatedSavingsMB: round(sum(candidates, 'savingsMB')),
    estimatedSavingsPercent: percent(sum(candidates, 'savingsMB'), sum(candidates, 'originalMB')),
  },
  nextSteps: [
    'Ensure schema fields media_optimizados and media_optimizados_map exist.',
    'Update display helpers to resolve optimized URLs from media_optimizados_map when present.',
    'Run a one-record migration with explicit approval.',
    'Verify admin and public catalog visually.',
    'Only then migrate in small batches.',
  ],
  recordPlans,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(jsonPath, JSON.stringify(plan, null, 2), 'utf8');
writeFileSync(csvPath, toCsv(recordPlans), 'utf8');

console.log(JSON.stringify({ ok: true, mode: 'dry-run', summary: plan.summary, jsonPath, csvPath }, null, 2));

function buildOptimizedFilename(item) {
  const extension = extname(item.filename);
  const base = basename(item.filename, extension);
  return `${sanitizeFilename(base)}__optimized.webp`;
}

function findLatestShadowSummaryPath() {
  const reportsDir = 'reports';
  if (!existsSync(reportsDir)) return null;
  return readdirSync(reportsDir)
    .filter((name) => name.startsWith('media-shadow-'))
    .map((name) => ({ path: join(reportsDir, name, 'summary.json'), mtime: statSync(join(reportsDir, name)).mtimeMs }))
    .filter((item) => existsSync(item.path))
    .sort((a, b) => b.mtime - a.mtime)[0]?.path || null;
}

function toCsv(recordPlans) {
  const headers = [
    'collection',
    'recordId',
    'recordLabel',
    'originalField',
    'originalFilename',
    'plannedOptimizedFilename',
    'originalMB',
    'optimizedMB',
    'savingsMB',
    'savingsPercent',
    'sourceSamplePath',
    'operation',
  ];
  const rows = [];
  for (const plan of recordPlans) {
    for (const upload of plan.uploads) {
      rows.push({
        collection: plan.collection,
        recordId: plan.recordId,
        recordLabel: plan.recordLabel,
        originalField: upload.originalField,
        originalFilename: upload.originalFilename,
        plannedOptimizedFilename: upload.plannedOptimizedFilename,
        originalMB: upload.originalMB,
        optimizedMB: upload.optimizedMB,
        savingsMB: upload.savingsMB,
        savingsPercent: upload.savingsPercent,
        sourceSamplePath: upload.sourceSamplePath,
        operation: 'upload to media_optimizados and update media_optimizados_map; do not remove original',
      });
    }
  }
  return [headers.join(','), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(','))].join('\n');
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

function round(value) {
  return Math.round(value * 100) / 100;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 10000) / 100;
}
