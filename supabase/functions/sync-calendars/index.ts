import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, calendar_id, room_id } = await req.json();
    console.log(`[sync-calendars] Action: ${action}, Calendar: ${calendar_id}, Room: ${room_id}`);

    if (action === 'sync_all') {
      // Sync all enabled calendars
      const { data: calendars, error: calError } = await supabase
        .from('external_calendars')
        .select('*')
        .eq('sync_enabled', true);

      if (calError) throw calError;

      console.log(`[sync-calendars] Found ${calendars?.length || 0} calendars to sync`);

      const results = [];
      for (const calendar of calendars || []) {
        try {
          const result = await syncCalendar(supabase, calendar);
          results.push({ id: calendar.id, success: true, ...result });
        } catch (err: any) {
          console.error(`[sync-calendars] Error syncing calendar ${calendar.id}:`, err);
          results.push({ id: calendar.id, success: false, error: err.message });
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

  } catch (error: any) {
    console.error('[sync-calendars] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncCalendar(supabase: any, calendar: any) {
  console.log(`[sync-calendars] Fetching iCal from: ${calendar.ical_url}`);
  
  // Fetch iCal data
  const response = await fetch(calendar.ical_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal: ${response.status}`);
  }
  
  const icalData = await response.text();
  console.log(`[sync-calendars] Received ${icalData.length} bytes of iCal data`);
  
  // Parse events
  const events = parseICalEvents(icalData);
  console.log(`[sync-calendars] Parsed ${events.length} events`);
  
  // Delete existing blocked dates for this calendar
  const { error: deleteError } = await supabase
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
    const { error: insertError } = await supabase
      .from('blocked_dates')
      .insert(blockedDates);
    
    if (insertError) throw insertError;
  }
  
  // Update last synced timestamp
  await supabase
    .from('external_calendars')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', calendar.id);
  
  return { eventsImported: events.length };
}

async function generateICalExport(supabase: any, roomId: string) {
  // Get room info
  const { data: room } = await supabase
    .from('rooms')
    .select('title, room_number')
    .eq('id', roomId)
    .single();
  
  // Get bookings for the room
  const { data: bookings } = await supabase
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

  for (const booking of bookings || []) {
    const uid = `booking-${booking.id}@mbasuites.com`;
    const created = booking.created_at.replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtstart = booking.check_in_date.replace(/-/g, '');
    const dtend = booking.check_out_date.replace(/-/g, '');
    
    ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${created}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
SUMMARY:Booked - ${booking.guest_name || 'Guest'}
STATUS:CONFIRMED
END:VEVENT
`;
  }

  ical += 'END:VCALENDAR';
  
  return ical;
}
