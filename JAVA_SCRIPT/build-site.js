const fs = require('node:fs');
const path = require('node:path');

const sourceRoot = path.resolve(__dirname, '..');
const outputDirectory = path.resolve(process.argv[2] || path.join(sourceRoot, 'dist'));

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
  ['Assets/PDF/AuraKare_Conversion_Guide.pdf', 'AuraKare_Conversion_Guide.pdf'],
  ['backend/contact.php', 'api/contact.php']
];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const [sourceFile, outputFile] of publicFiles) {
  const destination = path.join(outputDirectory, outputFile);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, sourceFile), destination);
}

fs.cpSync(path.join(sourceRoot, 'Assets'), path.join(outputDirectory, 'Assets'), { recursive: true });
