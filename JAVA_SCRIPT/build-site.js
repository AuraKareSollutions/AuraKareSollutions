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
    'robots.txt',
    'site.webmanifest',
    '.htaccess'
  ].map((file) => [file, file]),
  ['JAVA_SCRIPT/sectors-galaxy.js', 'sectors-galaxy.js'],
  ['JAVA_SCRIPT/script.js', 'script.js'],
  ['Assets/Brand_Logo/ak-favicon-v3.png', 'ak-favicon-v3.png'],
  ['Assets/CTA_Banners/cta-banner.svg', 'cta-banner.svg'],
  ['Assets/PDF/AuraKare_Conversion_Guide.pdf', 'AuraKare_Conversion_Guide.pdf'],
  ['backend/contact.php', 'api/contact.php']
];

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function optimizeHtml(html) {
  return html
    .replace(/<link rel="stylesheet" href="([^"]+)">/g, '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$1"></noscript>')
    .replace(/<script src="([^"]+)"><\/script>/g, '<script src="$1" defer><\/script>')
    .replace(/(<video\s+class="footer-logo"[^>]*?)>/g, '$1 data-lazy-video>')
    .replace(/(<video\s+class="footer-logo"[^>]*?)(preload=")auto("[^>]*>\s*<source\s+)src=/g, '$1$2none$3data-src=')
    .replace(/(<video\s+(?![^>]*data-lazy-video)[^>]*?)preload="auto"/g, '$1preload="metadata"');
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const [sourceFile, outputFile] of publicFiles) {
  const sourcePath = path.join(sourceRoot, sourceFile);
  const destination = path.join(outputDirectory, outputFile);
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  if (sourceFile.endsWith('.css')) {
    fs.writeFileSync(destination, minifyCss(fs.readFileSync(sourcePath, 'utf8')));
  } else if (sourceFile.endsWith('.html')) {
    fs.writeFileSync(destination, optimizeHtml(fs.readFileSync(sourcePath, 'utf8')));
  } else {
    fs.copyFileSync(sourcePath, destination);
  }
}

fs.cpSync(path.join(sourceRoot, 'Assets'), path.join(outputDirectory, 'Assets'), { recursive: true });
