import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());

const toBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const pdfUrl = 'https://www.aurakaresollutions.com/AuraKare_Conversion_Guide.pdf';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, Prefer',
  'Access-Control-Max-Age': '86400'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await req.json();
    const email = String(payload?.email || '').trim();

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || Deno.env.get('EMAIL_FROM') || 'hello@aurakaresollutions.com';

    if (!resendApiKey) {
      return new Response(JSON.stringify({
        error: 'RESEND_API_KEY is not configured.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error('Unable to fetch the PDF file for delivery.');
    }

    const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());
    const pdfBase64 = toBase64(pdfBytes);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: 'Your AuraKare Conversion Guide',
        html: `
          <h2>Your AuraKare Conversion Guide</h2>
          <p>Hi,</p>
          <p>Thank you for requesting the AuraKare Conversion Guide. Your PDF is attached below.</p>
          <p>Best regards,<br />AuraKare Sollutions</p>
        `,
        attachments: [{
          filename: 'AuraKare_Conversion_Guide.pdf',
          content: pdfBase64
        }]
      })
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(result?.message || 'Email delivery failed.');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Guide sent successfully.',
      email,
      messageId: result?.id || null
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('send-guide-email error:', error);

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unable to send the guide right now.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
