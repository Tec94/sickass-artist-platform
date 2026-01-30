import fs from 'node:fs';
import path from 'node:path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const root = path.resolve('public', 'merch');
const outputPath = path.resolve('src', 'data', 'merchImageManifest.ts');
const aliasPath = path.resolve('scripts', 'merchImageAliases.json');

const fileEntries = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      fileEntries.push(fullPath);
    }
  }
}

walk(root);

const manifest = {};
let aliases = {};

if (fs.existsSync(aliasPath)) {
  try {
    const raw = fs.readFileSync(aliasPath, 'utf8');
    aliases = JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read ${aliasPath}. Using empty aliases.`);
  }
}

const staged = new Map();

for (const filePath of fileEntries) {
  const rel = path.relative(root, filePath).split(path.sep);
  if (rel.length < 3) continue;

  const [category, productSlug, fileName] = rel;
  const match = /^(.+)-(\d+)-(\d+)\.(\w+)$/.exec(fileName);
  if (!match) continue;

  const [, slug, variationRaw, imageRaw] = match;
  if (slug !== productSlug) continue;

  const firstIndex = Number(variationRaw);
  const secondIndex = Number(imageRaw);
  if (!Number.isFinite(firstIndex) || !Number.isFinite(secondIndex)) continue;

  const webPath = `/${path.posix.join('merch', category, productSlug, fileName)}`;

  if (!staged.has(productSlug)) {
    staged.set(productSlug, { category, files: [] });
  }
  staged.get(productSlug).files.push({ firstIndex, secondIndex, url: webPath });
}

for (const [productSlug, entry] of staged.entries()) {
  const files = entry.files;
  const hasMultiVariation = files.some((file) => file.secondIndex > 1);
  const uniqueFirst = new Set(files.map((file) => file.firstIndex));
  const useImageFirst = !hasMultiVariation && uniqueFirst.size > 1;

  manifest[productSlug] = { category: entry.category, variations: {} };
  const variations = manifest[productSlug].variations;

  for (const file of files) {
    const variationIndex = useImageFirst ? 1 : file.firstIndex;
    const imageIndex = useImageFirst ? file.firstIndex : file.secondIndex;
    if (!variations[variationIndex]) {
      variations[variationIndex] = [];
    }
    variations[variationIndex].push({ imageIndex, url: file.url });
  }
}

for (const entry of Object.values(manifest)) {
  const variations = entry.variations;
  for (const [key, images] of Object.entries(variations)) {
    const ordered = images
      .sort((a, b) => a.imageIndex - b.imageIndex)
      .map((img) => img.url);
    variations[key] = ordered;
  }
}

const output = `export const merchImageManifest = ${JSON.stringify(manifest, null, 2)} as const;\n\n` +
  `export const merchImageAliases = ${JSON.stringify(aliases, null, 2)} as const;\n\n` +
  `export type MerchImageManifest = typeof merchImageManifest;\n` +
  `export type MerchImageAliases = typeof merchImageAliases;\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Wrote ${Object.keys(manifest).length} product entries to ${outputPath}`);

const deploymentUrl =
  process.env.CONVEX_URL || process.env.VITE_CONVEX_DEPLOYMENT_URL;
const adminKey = process.env.CONVEX_ADMIN_KEY;
const uploadToken = process.env.MERCH_MANIFEST_TOKEN;

if (!deploymentUrl) {
  console.log('Skipping Convex upload (set CONVEX_URL or VITE_CONVEX_DEPLOYMENT_URL).');
  process.exit(0);
}

const client = new ConvexHttpClient(deploymentUrl);
if (adminKey) {
  client.setAdminAuth(adminKey);
}

try {
  const result = await client.mutation(api.merchManifest.uploadMerchImageManifest, {
    manifest,
    aliases,
    token: uploadToken,
  });
  console.log('Uploaded manifest to Convex.', result);
} catch (error) {
  console.error('Failed to upload manifest to Convex:', error instanceof Error ? error.message : error);
}
