const fs = require('node:fs');
const path = require('node:path');

const outputDirectory = path.resolve(process.argv[2] || 'dist');
const supabaseUrl = process.env.Supabase_Public_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.Supabase_Anon_Key || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Set Supabase_Public_URL and Supabase_Anon_Key in the Vercel project environment.');
}

const publicFiles = [
  'about-AuraKare_Sollutions.html',
  'ai-ready-processing.html',
  'bpo-workflows.html',
  'data-security.html',
  'document-scanning.html',
  'download-guide.html',
  'get-in-touch.html',
  'index.html',
  'legacy-data-transformation.html',
  'privacy-policy.html',
  'sectors.html',
  'sectors-galaxy.js',
  'style.css',
  'script.js',
  'sitemap.xml',
  'robots.txt',
  'GoogleBrand.jpeg',
  'ak-favicon-v3.png',
  'cta-banner.svg',
  'AuraKare_Conversion_Guide.pdf'
];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of publicFiles) {
  fs.copyFileSync(file, path.join(outputDirectory, file));
}

fs.cpSync('Assets', path.join(outputDirectory, 'Assets'), { recursive: true });

const config = { url: supabaseUrl, anonKey: supabaseAnonKey };
fs.writeFileSync(
  path.join(outputDirectory, 'supabase-config.js'),
  `window.supabaseConfig = ${JSON.stringify(config)};\n`
);
