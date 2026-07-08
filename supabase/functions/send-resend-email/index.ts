import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      to,
      subject,
      html,
      text,
      from,
      maxRetries,
      retryBaseDelayMs,
    } = await req.json();
    if (!to || !subject || (!html && !text)) {
      return new Response(JSON.stringify({ error: 'Missing to/subject/html|text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clamp retry params so callers cannot exhaust the function runtime.
    const retries = Math.min(Math.max(Number.isFinite(maxRetries) ? Number(maxRetries) : 0, 0), 5);
    const baseDelay = Math.min(
      Math.max(Number.isFinite(retryBaseDelayMs) ? Number(retryBaseDelayMs) : 0, 0),
      10_000,
    );

    const payload = JSON.stringify({
      from: from ?? 'Trendflux <noreply@trendflux.digital>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    let lastStatus = 0;
    let lastDetails = '';
    for (let attempt = 0; attempt <= retries; attempt++) {
      const response = await fetch(`${GATEWAY_URL}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': RESEND_API_KEY,
        },
        body: payload,
      });

      if (response.ok) {
        const data = await response.json();
        return new Response(
          JSON.stringify({ success: true, id: data.id, attempts: attempt + 1 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      lastStatus = response.status;
      lastDetails = await response.text();
      const retryable = response.status === 429 || response.status >= 500;
      console.error(
        `Resend failed [${response.status}] attempt ${attempt + 1}/${retries + 1}: ${lastDetails}`,
      );
      if (!retryable || attempt >= retries) break;
      await sleep(baseDelay * Math.pow(2, attempt));
    }

    return new Response(
      JSON.stringify({
        error: 'Provider request failed',
        status: lastStatus,
        details: lastDetails,
        attempts: retries + 1,
      }),
      { status: lastStatus || 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('send-resend-email error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});