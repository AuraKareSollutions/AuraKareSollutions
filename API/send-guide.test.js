const test = require('node:test');
const assert = require('node:assert/strict');

const { validateGuideEmail, buildGuideEmail } = require('./send-guide.js');

test('valid guide email is accepted', () => {
  assert.equal(validateGuideEmail('hello@example.com'), true);
});

test('invalid guide email is rejected', () => {
  assert.equal(validateGuideEmail('not-an-email'), false);
});

test('guide email payload includes PDF attachment metadata', () => {
  const payload = buildGuideEmail('hello@example.com');
  assert.match(payload.subject, /AuraKare/i);
  assert.match(payload.text, /AuraKare/i);
  assert.match(payload.html, /AuraKare/i);
  assert.equal(payload.attachments[0].filename, 'AuraKare_Conversion_Guide.pdf');
});

test('guide form downloads the PDF directly', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'download-guide.html'), 'utf8');
  assert.match(html, /rest\/v1\/submissions/);
  assert.match(html, /inquiry_type: 'general-inquiries'/);
  assert.match(html, /downloadLink\.download\s*=\s*['"]AuraKare_Conversion_Guide\.pdf/);
  assert.match(html, /\/AuraKare_Conversion_Guide\.pdf/);
});
