// The runtime is Deno on Supabase Functions. The TypeScript server in VS Code
// may not be able to resolve the remote modules; ignore type checking for these imports.
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore: Remote import (Deno runtime)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore: Remote import (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Remote import (Deno runtime)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
/* eslint-enable @typescript-eslint/ban-ts-comment */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple iCal parser
function parseICalEvents(icalData: string): Array<{
  uid: string;
  summary: string;
  startDate: string;
  endDate: string;
}> {
  const events: Array<{
    uid: string;
    summary: string;
    startDate: string;
    endDate: string;
  }> = [];
  
  // Split into events
  const eventBlocks = icalData.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const endIndex = block.indexOf('END:VEVENT');
    if (endIndex === -1) continue;
    
    const eventContent = block.substring(0, endIndex);
    
    // Extract fields
    const uid = extractField(eventContent, 'UID');
    const summary = extractField(eventContent, 'SUMMARY') || 'Blocked';
    const dtstart = extractField(eventContent, 'DTSTART');
    const dtend = extractField(eventContent, 'DTEND');
    
    if (uid && dtstart && dtend) {
      events.push({
        uid,
        summary,
        startDate: parseICalDate(dtstart),
        endDate: parseICalDate(dtend),
      });
    }
  }
  
  return events;
}

function extractField(content: string, fieldName: string): string | null {
  // Handle both simple and parameterized fields like DTSTART;VALUE=DATE:20240101
  const patterns = [
    new RegExp(`^${fieldName}[;:](.*)$`, 'm'),
    new RegExp(`^${fieldName};[^:]*:(.*)$`, 'm'),
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      // For parameterized fields, get the value after the colon
      let value = match[1].trim();
      if (value.includes(':')) {
        value = value.split(':').pop() || value;
      }
      return value;
    }
  }
  return null;
}

function parseICalDate(dateStr: string): string {
  // Handle formats: 20240101, 20240101T120000Z, 20240101T120000
  const cleanDate = dateStr.replace(/[^0-9TZ]/g, '');
  
  if (cleanDate.length >= 8) {
    const year = cleanDate.substring(0, 4);
    const month = cleanDate.substring(4, 6);
    const day = cleanDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

serve(async (req: Request) => { // typed as Web API Request for clarity
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Deno.env may not be visible to the TypeScript language server; access via globalThis with a narrow helper
    const denoGet = (globalThis as unknown as { Deno?: { env?: { get(k: string): string | undefined } } }).Deno?.env?.get;
    if (!denoGet) throw new Error('Deno.env.get is not available in this environment');
    const supabaseUrl = denoGet('SUPABASE_URL');
    const supabaseServiceKey = denoGet('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Support GET requests (for external calendar platforms fetching .ics) as well as JSON POST bodies
    let action: string | undefined;
    let calendar_id: string | undefined;
    let room_id: string | undefined;

    // Log request details for diagnostics
    console.log(`[sync-calendars] Incoming request: method=${req.method}, url=${req.url}, content-type=${req.headers.get('content-type')}`);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action') || undefined;
      calendar_id = url.searchParams.get('calendar_id') || undefined;
      room_id = url.searchParams.get('room_id') || undefined;

      // Support a friendly .ics path like /.../sync-calendars/<room_id>.ics
      const pathname = url.pathname;
      const m = pathname.match(/\/([^/]+)\.ics$/);
      if (m && !room_id) {
        room_id = m[1];
        action = 'export_ical';
      }
    } else {
      // Only attempt to parse JSON if Content-Type indicates JSON to avoid "Unexpected end of JSON input"
      const contentType = req.headers.get('content-type') || '';
      type RequestBody = { action?: string; calendar_id?: string; room_id?: string; [k: string]: unknown };
      let body: RequestBody = {};
      if (contentType.includes('application/json')) {
        try {
          body = await req.json() as RequestBody;
        } catch (err) {
          console.log('[sync-calendars] Failed to parse JSON body:', String(err));
          body = {};
        }
      } else {
        // As a fallback, try to extract params from the URL (for some proxies that forward POST with query params)
        try {
          const url = new URL(req.url);
          action = action || url.searchParams.get('action') || undefined;
          calendar_id = calendar_id || url.searchParams.get('calendar_id') || undefined;
          room_id = room_id || url.searchParams.get('room_id') || undefined;
        } catch (e) {
          // ignore
        }
      }
      action = action || body?.action;
      calendar_id = calendar_id || body?.calendar_id;
      room_id = room_id || body?.room_id;
    }

    console.log(`[sync-calendars] Action: ${action}, Calendar: ${calendar_id}, Room: ${room_id}`);

    // If debug=1 is present, return useful diagnostic info (no secrets)
    try {
      const urlObj = new URL(req.url);
      if (urlObj.searchParams.get('debug') === '1') {
        const headersObj: Record<string, string> = {};
        req.headers.forEach((v, k) => {
          const lk = k.toLowerCase();
          if (lk === 'authorization' || lk === 'apikey') headersObj[k] = '***';
          else headersObj[k] = v;
        });

        let roomCheck: boolean | string | null = null;
        if (room_id) {
          try {
            const { data: room, error: roomError } = await supabase
              .from('rooms')
              .select('id')
              .eq('id', room_id)
              .single();
            if (roomError) roomCheck = `error: ${String(roomError)}`;
            else roomCheck = !!room;
          } catch (e) {
            roomCheck = `exception: ${String(e)}`;
          }
        }

        return new Response(JSON.stringify({ debug: true, method: req.method, action, room_id, headers: headersObj, roomExists: roomCheck }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {
      console.log('[sync-calendars] Debug path error:', String(e));
    }

    if (action === 'sync_all') {
      // Sync all enabled calendars
      const { data: calendars, error: calError } = await supabase
        .from('external_calendars')
        .select('*')
        .eq('sync_enabled', true);

      if (calError) throw calError;

      console.log(`[sync-calendars] Found ${calendars?.length || 0} calendars to sync`);

      const results = [];
      for (const calendar of (calendars || []) as Array<ExternalCalendarRow>) {
        try {
          const result = await syncCalendar(supabase, calendar);
          results.push({ id: calendar.id, success: true, ...result });
        } catch (err: unknown) {
          console.error(`[sync-calendars] Error syncing calendar ${calendar.id}:`, err);
          const e = err as { message?: string };
          results.push({ id: calendar.id, success: false, error: e?.message });
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'sync_one' && calendar_id) {
      // Sync single calendar
      const { data: calendar, error: calError } = await supabase
        .from('external_calendars')
        .select('*')
        .eq('id', calendar_id)
        .single();

      if (calError) throw calError;

      const result = await syncCalendar(supabase, calendar);

      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'export_ical' && room_id) {
      // Generate iCal export for a room
      const icalContent = await generateICalExport(supabase, room_id);

      return new Response(icalContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="room-${room_id}.ics"`,
        },
      });

    } else {
      throw new Error('Invalid action or missing parameters');
    }

  } catch (error: unknown) {
    console.error('[sync-calendars] Error:', error);
    const e = error as { message?: string };
    return new Response(JSON.stringify({ error: e?.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

type ExternalCalendarRow = {
  id: string;
  ical_url: string;
  room_id: string;
  platform?: string;
};

// Minimal supabase client shape used by this function to avoid importing remote types
type SupabaseFrom = {
  select: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  delete?: (...args: unknown[]) => Promise<{ error: unknown }>;
  insert?: (rows: unknown[]) => Promise<{ error: unknown }>;
  update?: (obj: unknown) => { eq: (col: string, val: unknown) => Promise<unknown> } | Promise<unknown>;
  eq?: (col: string, val: unknown) => unknown;
  single?: () => Promise<{ data: unknown; error: unknown }>;
  gte?: (col: string, val: unknown) => unknown;
  neq?: (col: string, val: unknown) => unknown;
};

type SupabaseLike = {
  from: (table: string) => SupabaseFrom;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
async function syncCalendar(supabaseClient: any, calendar: ExternalCalendarRow) {
  console.log(`[sync-calendars] Fetching iCal from: ${calendar.ical_url}`);
  
  // Fetch iCal data
  const response = await fetch(calendar.ical_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal: ${response.status}`);
  }
  
  const icalData = await response.text();
  console.log(`[sync-calendars] Received ${icalData.length} bytes of iCal data`);
  
  // Defensive: ensure calendar.room_id exists
  if (!calendar.room_id) {
    throw new Error('Calendar missing room_id');
  }  
  // Parse events
  const events = parseICalEvents(icalData);
  console.log(`[sync-calendars] Parsed ${events.length} events`);
  
  // Delete existing blocked dates for this calendar
  const { error: deleteError } = await (supabaseClient as any)
    .from('blocked_dates')
    .delete()
    .eq('external_calendar_id', calendar.id);
  
  if (deleteError) throw deleteError;
  
  // Insert new blocked dates
  const blockedDates = events.map(event => ({
    room_id: calendar.room_id,
    external_calendar_id: calendar.id,
    start_date: event.startDate,
    end_date: event.endDate,
    external_id: event.uid,
    summary: `${calendar.platform}: ${event.summary}`,
  }));
  
  if (blockedDates.length > 0) {
    const { error: insertError } = await (supabaseClient as any)
      .from('blocked_dates')
      .insert(blockedDates);
    
    if (insertError) throw insertError;
  }
  
  // Update last synced timestamp
  await (supabaseClient as any)
    .from('external_calendars')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', calendar.id);
  
  return { eventsImported: events.length };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
async function generateICalExport(supabaseClient: any, roomId: string) {
  // Get room info
  const { data: room } = await (supabaseClient as any)
    .from('rooms')
    .select('title, room_number')
    .eq('id', roomId)
    .single();
  
  // Get bookings for the room
  const { data: bookings } = await (supabaseClient as any)
    .from('bookings')
    .select('*')
    .eq('room_id', roomId)
    .neq('status', 'cancelled')
    .gte('check_out_date', new Date().toISOString().split('T')[0]);
  
  // Build iCal content
  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MBA Suites//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${room?.title || 'Room'} - ${room?.room_number || roomId}
`;

  for (const booking of (bookings || []) as Array<Record<string, unknown>>) {
    const uid = `booking-${String(booking['id'])}@mbasuites.com`;
    const created = (String(booking['created_at'] || '')).replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtstart = (String(booking['check_in_date'] || '')).replace(/-/g, '');
    const dtend = (String(booking['check_out_date'] || '')).replace(/-/g, '');
    
    ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${created}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
SUMMARY:Booked - ${String(booking['guest_name'] || 'Guest')}
STATUS:CONFIRMED
END:VEVENT
`;
  }

  ical += 'END:VCALENDAR';
  
  return ical;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
