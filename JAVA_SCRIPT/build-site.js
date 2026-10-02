const fs = require('node:fs');
const path = require('node:path');

const sourceRoot = path.resolve(__dirname, '..');
const outputDirectory = path.resolve(process.argv[2] || path.join(sourceRoot, 'dist'));
const supabaseUrl = process.env.Supabase_Public_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.Supabase_Anon_Key || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Set Supabase_Public_URL and Supabase_Anon_Key in the Vercel project environment.');
}

const publicFiles = [
  ...[
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
    'style.css',
    'sitemap.xml',
    'robots.txt'
  ].map((file) => [file, file]),
  ['JAVA_SCRIPT/sectors-galaxy.js', 'sectors-galaxy.js'],
  ['JAVA_SCRIPT/script.js', 'script.js'],
  ['Assets/Brand_Logo/ak-favicon-v3.png', 'ak-favicon-v3.png'],
  ['Assets/CTA_Banners/cta-banner.svg', 'cta-banner.svg'],
  ['Assets/PDF/AuraKare_Conversion_Guide.pdf', 'AuraKare_Conversion_Guide.pdf']
];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const [sourceFile, outputFile] of publicFiles) {
  const destination = path.join(outputDirectory, outputFile);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, sourceFile), destination);
}

fs.cpSync(path.join(sourceRoot, 'Assets'), path.join(outputDirectory, 'Assets'), { recursive: true });

const config = { url: supabaseUrl, anonKey: supabaseAnonKey };
fs.writeFileSync(
  path.join(outputDirectory, 'supabase-config.js'),
  `window.supabaseConfig = ${JSON.stringify(config)};\n`
);
