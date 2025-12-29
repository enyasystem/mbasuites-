/* eslint-disable @typescript-eslint/ban-ts-comment */
// Minimal Deno function to verify Supabase functions deployments and routing
// Call: https://<project>.supabase.co/functions/v1/sync-calendars-ping
// Returns JSON { ok: true, version: 'sync-calendars-ping-YYYY-MM-DD-HH-mm' }

// @ts-ignore: Remote import (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VERSION = 'sync-calendars-ping-2025-12-29-16-40';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return new Response(JSON.stringify({ ok: true, version: VERSION }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});