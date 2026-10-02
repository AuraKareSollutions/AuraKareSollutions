const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');

const PDF_FILENAME = 'AuraKare_Conversion_Guide.pdf';

function validateGuideEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildGuideEmail(email) {
  const recipient = email.trim();
  const pdfPath = path.resolve(__dirname, '..', PDF_FILENAME);
  const attachment = fs.existsSync(pdfPath)
    ? [{
        filename: PDF_FILENAME,
        content: fs.readFileSync(pdfPath),
        contentType: 'application/pdf'
      }]
    : [];

  return {
    to: recipient,
    from: process.env.EMAIL_FROM || 'hello@aurakaresollutions.com',
    subject: 'Your AuraKare Conversion Guide',
    text: [
      'Hi,',
      '',
      'Thank you for requesting the AuraKare Conversion Guide.',
      'Your PDF is attached below.',
      '',
      'Best regards,',
      'AuraKare Sollutions'
    ].join('\n'),
    html: `
      <h2>Your AuraKare Conversion Guide</h2>
      <p>Hi,</p>
      <p>Thank you for requesting the AuraKare Conversion Guide. Your PDF is attached below.</p>
      <p>Best regards,<br />AuraKare Sollutions</p>
    `,
    attachments: attachment
  };
}

async function sendGuideEmail(email) {
  if (!validateGuideEmail(email)) {
    throw new Error('Please provide a valid email address.');
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('Guide email delivery is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS in your deployment environment.');
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const payload = buildGuideEmail(email);
  const result = await transport.sendMail(payload);

  return {
    messageId: result.messageId,
    email: payload.to
  };
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!validateGuideEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const result = await sendGuideEmail(email);

    return res.status(200).json({
      success: true,
      message: 'Guide sent successfully.',
      email: result.email,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Guide email failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unable to send the guide right now.'
    });
  }
}

module.exports = handler;
module.exports.validateGuideEmail = validateGuideEmail;
module.exports.buildGuideEmail = buildGuideEmail;
module.exports.sendGuideEmail = sendGuideEmail;
