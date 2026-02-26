import fs from 'node:fs';
import path from 'node:path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

function loadEnvFile(fileName, { override = false } = {}) {
  const filePath = path.resolve(fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex <= 0) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key) continue;
    if (!override && process.env[key] !== undefined) continue;

    let value = trimmed.slice(equalsIndex + 1).trim();
    if (!value) {
      process.env[key] = '';
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }

    process.env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local', { override: true });

const inputPath = path.resolve('public', 'data', 'artist-scraped-data.json');

if (!fs.existsSync(inputPath)) {
  console.error(`Missing input file: ${inputPath}`);
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (error) {
  console.error(`Failed to parse ${inputPath}:`, error instanceof Error ? error.message : error);
  process.exit(1);
}

const deploymentUrl =
  process.env.CONVEX_URL ||
  process.env.VITE_CONVEX_DEPLOYMENT_URL ||
  process.env.VITE_CONVEX_URL;
const adminKey = process.env.CONVEX_ADMIN_KEY;
const uploadToken = process.env.PHONE_CONTENT_UPLOAD_TOKEN;

if (!deploymentUrl) {
  console.log('Skipping Convex upload (set CONVEX_URL, VITE_CONVEX_DEPLOYMENT_URL, or VITE_CONVEX_URL).');
  process.exit(0);
}

const client = new ConvexHttpClient(deploymentUrl);
if (adminKey) {
  client.setAdminAuth(adminKey);
}

try {
  const result = await client.mutation(api.phoneContent.uploadPhoneArtistContentPayload, {
    payload,
    source: '/data/artist-scraped-data.json',
    token: uploadToken,
  });
  console.log('Uploaded phone artist content payload to Convex.', result);
} catch (error) {
  console.error(
    'Failed to upload phone artist content payload to Convex:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
