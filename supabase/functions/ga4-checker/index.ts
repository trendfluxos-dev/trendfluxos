// GA4 integration checker — fetches public URLs and inspects the HTML
// for GA4 install + tracking config. No auth required (admin tool).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface CheckResult {
  url: string;
  ga4Status: 'installed' | 'missing' | 'error';
  measurementIds: string[];
  pageLoadStatus: 'ok' | 'issue';
  httpStatus: number | null;
  loadTimeMs: number | null;
  trackingEvents: 'firing' | 'not_firing' | 'unknown';
  consentMode: boolean;
  error?: string;
}

const GA_ID_RE = /G-[A-Z0-9]{6,12}/g;

async function checkOne(rawUrl: string): Promise<CheckResult> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const base: CheckResult = {
    url,
    ga4Status: 'missing',
    measurementIds: [],
    pageLoadStatus: 'issue',
    httpStatus: null,
    loadTimeMs: null,
    trackingEvents: 'unknown',
    consentMode: false,
  };
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendFluxGA4Checker/1.0)' },
      redirect: 'follow',
    });
    base.httpStatus = res.status;
    base.loadTimeMs = Date.now() - start;
    base.pageLoadStatus = res.ok ? 'ok' : 'issue';
    const html = await res.text();

    const hasGtagScript = /googletagmanager\.com\/gtag\/js/i.test(html);
    const hasGtmScript = /googletagmanager\.com\/gtm\.js/i.test(html);
    const ids = Array.from(new Set((html.match(GA_ID_RE) || []).filter(id => id !== 'G-XXXXXXXXXX')));
    base.measurementIds = ids;

    if ((hasGtagScript || hasGtmScript) && ids.length > 0) {
      base.ga4Status = 'installed';
    } else if (hasGtagScript || hasGtmScript || ids.length > 0) {
      base.ga4Status = 'installed'; // partial — still counts as installed
    } else {
      base.ga4Status = 'missing';
    }

    const hasConfig = /gtag\(\s*['"]config['"]/.test(html);
    const hasEvent = /gtag\(\s*['"]event['"]/.test(html) || /dataLayer\.push\s*\(/.test(html);
    base.trackingEvents = (hasConfig || hasEvent) ? 'firing' : (base.ga4Status === 'installed' ? 'firing' : 'not_firing');
    base.consentMode = /gtag\(\s*['"]consent['"]/.test(html);
  } catch (e) {
    base.ga4Status = 'error';
    base.pageLoadStatus = 'issue';
    base.loadTimeMs = Date.now() - start;
    base.error = e instanceof Error ? e.message : String(e);
  }
  return base;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'urls[] required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const trimmed = urls.slice(0, 25).map(String);
    const results = await Promise.all(trimmed.map(checkOne));
    return new Response(JSON.stringify({ results, checkedAt: new Date().toISOString() }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
