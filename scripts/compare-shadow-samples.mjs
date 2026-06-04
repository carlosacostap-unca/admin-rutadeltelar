import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
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
const sourceSummaryPath = process.env.MEDIA_SHADOW_SUMMARY_PATH || findLatestShadowSummaryPath();
const reviewLimit = Number(process.env.MEDIA_COMPARE_LIMIT || 12);
const rowsPerSheet = Number(process.env.MEDIA_COMPARE_ROWS_PER_SHEET || 6);
const generatedAt = new Date().toISOString();
const safeTimestamp = generatedAt.replace(/[:.]/g, '-');
const outputDir = join('reports', `media-visual-compare-${safeTimestamp}`);

const cardWidth = 1200;
const cardHeight = 520;
const imageWidth = 560;
const imageHeight = 360;
const gutter = 24;
const padding = 24;
const labelHeight = 88;

if (!pbUrl || !adminEmail || !adminPassword) {
  throw new Error('Missing PocketBase env vars. Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.');
}

if (!sourceSummaryPath || !existsSync(sourceSummaryPath)) {
  throw new Error('Missing shadow optimization summary. Run npm run media:shadow-optimize first or set MEDIA_SHADOW_SUMMARY_PATH.');
}

mkdirSync(outputDir, { recursive: true });

const token = await authenticate();
const summary = JSON.parse(readFileSync(sourceSummaryPath, 'utf8'));
const candidates = summary.results
  .filter((item) => item.status === 'optimized' && item.samplePath && existsSync(item.samplePath))
  .sort((a, b) => b.savingsMB - a.savingsMB)
  .slice(0, reviewLimit);

const cards = [];
for (const [index, item] of candidates.entries()) {
  const original = await downloadFile(item.sourceUrl);
  const optimized = readFileSync(item.samplePath);
  const card = await buildComparisonCard(item, original, optimized, index + 1);
  cards.push(card);
}

const sheets = [];
for (let start = 0; start < cards.length; start += rowsPerSheet) {
  const chunk = cards.slice(start, start + rowsPerSheet);
  const sheetPath = join(outputDir, `sheet-${String(sheets.length + 1).padStart(2, '0')}.jpg`);
  await buildSheet(chunk, sheetPath);
  sheets.push(sheetPath);
}

const report = {
  ok: true,
  mode: 'visual-review-read-only',
  generatedAt,
  sourceSummaryPath,
  reviewed: candidates.length,
  sheets,
  items: candidates.map((item, index) => ({
    index: index + 1,
    collection: item.collection,
    recordId: item.recordId,
    recordLabel: item.recordLabel,
    field: item.field,
    filename: item.filename,
    originalMB: item.originalMB,
    optimizedMB: item.optimizedMB,
    savingsMB: item.savingsMB,
    savingsPercent: item.savingsPercent,
    samplePath: item.samplePath,
    sourceUrl: item.sourceUrl,
  })),
  note: 'This script downloads originals and creates local comparison sheets only. It does not update PocketBase records and does not delete storage files.',
};

const reportPath = join(outputDir, 'review.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify({ ok: true, generatedAt, reviewed: candidates.length, reportPath, sheets }, null, 2));

async function buildComparisonCard(item, original, optimized, index) {
  const originalImage = await fitImage(original, imageWidth, imageHeight);
  const optimizedImage = await fitImage(optimized, imageWidth, imageHeight);
  const title = `${index}. ${item.collection} / ${item.recordLabel || item.recordId}`;
  const subtitle = `${item.field} - ${item.filename}`;
  const savings = `Ahorro: ${item.savingsMB} MB (${item.savingsPercent}%)`;

  const svg = `
    <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f7f4ef"/>
      <rect x="12" y="12" width="${cardWidth - 24}" height="${cardHeight - 24}" rx="8" fill="#ffffff" stroke="#d8d1c6"/>
      <text x="${padding}" y="44" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#302820">${escapeXml(title)}</text>
      <text x="${padding}" y="72" font-family="Arial, sans-serif" font-size="17" fill="#665c50">${escapeXml(subtitle)}</text>
      <text x="${padding}" y="102" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#2c6b4f">${escapeXml(savings)}</text>
      <text x="${padding}" y="${cardHeight - 26}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#302820">Original ${item.originalMB} MB</text>
      <text x="${padding + imageWidth + gutter}" y="${cardHeight - 26}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#302820">Optimizada ${item.optimizedMB} MB</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .composite([
      { input: originalImage, left: padding, top: labelHeight + padding },
      { input: optimizedImage, left: padding + imageWidth + gutter, top: labelHeight + padding },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function fitImage(buffer, width, height) {
  const resized = await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();

  const metadata = await sharp(resized).metadata();
  const background = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: '#eee9df',
    },
  }).jpeg().toBuffer();

  return sharp(background)
    .composite([
      {
        input: resized,
        left: Math.round((width - (metadata.width || width)) / 2),
        top: Math.round((height - (metadata.height || height)) / 2),
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function buildSheet(cardBuffers, sheetPath) {
  const height = cardBuffers.length * cardHeight;
  const sheet = sharp({
    create: {
      width: cardWidth,
      height,
      channels: 3,
      background: '#f7f4ef',
    },
  });

  await sheet
    .composite(cardBuffers.map((input, index) => ({ input, left: 0, top: index * cardHeight })))
    .jpeg({ quality: 92 })
    .toFile(sheetPath);
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

function findLatestShadowSummaryPath() {
  const reportsDir = 'reports';
  if (!existsSync(reportsDir)) return null;
  return readdirSync(reportsDir)
    .filter((name) => name.startsWith('media-shadow-'))
    .map((name) => ({ name, path: join(reportsDir, name, 'summary.json'), mtime: statSync(join(reportsDir, name)).mtimeMs }))
    .filter((item) => existsSync(item.path))
    .sort((a, b) => b.mtime - a.mtime)[0]?.path || null;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
