import fs from 'fs';
import path from 'path';
import https from 'https';

const rawDir = path.join(process.cwd(), 'src', 'pages', 'StitchPrototypes', 'raw');
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

// These URLs are manually extracted from the earlier list_screens output for testing
const screens = [
  { name: 'Archive', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2I5NDZkOThjMDVlNTRkOGJhZTgwOGY2OTU3YWUyNzM4EgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=89354086' },
  { name: 'Directory', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Q0N2MzNjk2ZmJkZTQ0YjBhZjNjY2VmYWY2NTk5MWViEgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=89354086' }, // The Estate Directory - Complete Flow
  { name: 'Salon', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzk0NzA0ODA0YjMwYzQ1YTVhYTBjZDcyNThjOWIwN2UwEgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=89354086' },
  { name: 'Identity', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc0OTViMTUwZDBiODQ3OGM5MDJmODU0ODQ0ZDhlZDIzEgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=89354086' },
  { name: 'Community', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhhN2ZjZTMwYmVmMjRkMjBhNzQ2ZDUyZTU4MTM2Mjc5EgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=89354086' }
];

async function download() {
  for (const screen of screens) {
    const filePath = path.join(rawDir, `${screen.name}.html`);
    console.log(`Downloading ${screen.name}...`);
    
    await new Promise((resolve, reject) => {
      https.get(screen.url, (response) => {
        let content = '';
        response.on('data', chunk => { content += chunk; });
        response.on('end', () => {
          fs.writeFileSync(filePath, content);
          console.log(`Saved ${screen.name}`);
          resolve();
        });
      }).on('error', err => reject(err));
    });
  }
}

download().catch(console.error);
