# Edge Functions Setup for New Supabase Project

## Prerequisites
1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Login to CLI: `supabase login`
3. Link your project: `supabase link --project-ref ehpdimadogtqzarriuzz`

---

## 1. Create the Functions Directory Structure

In your local machine, create:
```
supabase/
├── config.toml
└── functions/
    ├── sync-calendars/
    │   └── index.ts
    └── send-booking-email/
        └── index.ts
```

---

## 2. Create `supabase/config.toml`

```toml
project_id = "ehpdimadogtqzarriuzz"

[functions.sync-calendars]
verify_jwt = false

[functions.send-booking-email]
verify_jwt = false
```

---

## 3. Create `supabase/functions/sync-calendars/index.ts`

```typescript
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
  const patterns = [
    new RegExp(`^${fieldName}[;:](.*)$`, 'm'),
    new RegExp(`^${fieldName};[^:]*:(.*)$`, 'm'),
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
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
  
  const response = await fetch(calendar.ical_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal: ${response.status}`);
  }
  
  const icalData = await response.text();
  console.log(`[sync-calendars] Received ${icalData.length} bytes of iCal data`);
  
  const events = parseICalEvents(icalData);
  console.log(`[sync-calendars] Parsed ${events.length} events`);
  
  const { error: deleteError } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('external_calendar_id', calendar.id);
  
  if (deleteError) throw deleteError;
  
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
  
  await supabase
    .from('external_calendars')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', calendar.id);
  
  return { eventsImported: events.length };
}

async function generateICalExport(supabase: any, roomId: string) {
  const { data: room } = await supabase
    .from('rooms')
    .select('title, room_number')
    .eq('id', roomId)
    .single();
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('room_id', roomId)
    .neq('status', 'cancelled')
    .gte('check_out_date', new Date().toISOString().split('T')[0]);
  
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
```

---

## 4. Create `supabase/functions/send-booking-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  type: "confirmation" | "status_update" | "reminder";
  bookingId: string;
  guestEmail: string;
  guestName: string;
  roomTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status?: string;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = { 'NGN': '₦', 'USD': '$', 'KES': 'KSh' };
  return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
};

const getEmailContent = (data: BookingEmailRequest) => {
  const { type, guestName, roomTitle, checkInDate, checkOutDate, totalAmount, currency, status, bookingId } = data;
  
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 28px; }
      .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
      .content { padding: 30px; }
      .booking-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #6c757d; font-size: 14px; }
      .detail-value { color: #212529; font-weight: 600; }
      .total { background: #1e3a5f; color: white; padding: 15px 20px; border-radius: 8px; margin-top: 20px; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
      .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: 600; font-size: 14px; }
      .status-confirmed { background: #d4edda; color: #155724; }
      .status-cancelled { background: #f8d7da; color: #721c24; }
      .status-completed { background: #cce5ff; color: #004085; }
      .status-pending { background: #fff3cd; color: #856404; }
    </style>
  `;

  if (type === "confirmation") {
    return {
      subject: `Booking Confirmed - MBA Suites | ${roomTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Thank you for choosing MBA Suites</p>
            </div>
            <div class="content">
              <p>Dear ${guestName},</p>
              <p>Your booking has been successfully confirmed. We're excited to host you!</p>
              
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #1e3a5f;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking Reference</span>
                  <span class="detail-value">${bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Room</span>
                  <span class="detail-value">${roomTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in</span>
                  <span class="detail-value">${formatDate(checkInDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">${formatDate(checkOutDate)}</span>
                </div>
              </div>
              
              <div class="total">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Total Amount</span>
                  <span style="font-size: 24px; font-weight: bold;">${formatCurrency(totalAmount, currency)}</span>
                </div>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us.</p>
              <p>We look forward to welcoming you!</p>
              <p><strong>The MBA Suites Team</strong></p>
            </div>
            <div class="footer">
              <p>MBA Suites | Premium Serviced Apartments</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  if (type === "status_update") {
    const statusClass = `status-${status?.toLowerCase() || 'pending'}`;
    const statusMessages: Record<string, string> = {
      confirmed: "Great news! Your booking has been confirmed.",
      cancelled: "Your booking has been cancelled as requested.",
      completed: "We hope you enjoyed your stay with us!",
      pending: "Your booking is being processed."
    };

    return {
      subject: `Booking ${status?.charAt(0).toUpperCase()}${status?.slice(1)} - MBA Suites`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Update</h1>
              <p>Your booking status has changed</p>
            </div>
            <div class="content">
              <p>Dear ${guestName},</p>
              <p>${statusMessages[status || 'pending']}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <span class="status-badge ${statusClass}">${status?.toUpperCase()}</span>
              </div>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">Booking Reference</span>
                  <span class="detail-value">${bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Room</span>
                  <span class="detail-value">${roomTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in</span>
                  <span class="detail-value">${formatDate(checkInDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">${formatDate(checkOutDate)}</span>
                </div>
              </div>
              
              <p style="margin-top: 30px;">Thank you for choosing MBA Suites.</p>
              <p><strong>The MBA Suites Team</strong></p>
            </div>
            <div class="footer">
              <p>MBA Suites | Premium Serviced Apartments</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Reminder email
  return {
    subject: `Reminder: Your Stay at MBA Suites Starts Soon!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Check-in Reminder</h1>
            <p>Your stay is coming up!</p>
          </div>
          <div class="content">
            <p>Dear ${guestName},</p>
            <p>This is a friendly reminder that your stay at MBA Suites is approaching.</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Room</span>
                <span class="detail-value">${roomTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-in Date</span>
                <span class="detail-value">${formatDate(checkInDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-out Date</span>
                <span class="detail-value">${formatDate(checkOutDate)}</span>
              </div>
            </div>
            
            <p style="margin-top: 30px;">We're preparing everything for your arrival. If you have any special requests, please let us know!</p>
            <p><strong>The MBA Suites Team</strong></p>
          </div>
          <div class="footer">
            <p>MBA Suites | Premium Serviced Apartments</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingEmailRequest = await req.json();
    console.log("Email request data:", { type: data.type, email: data.guestEmail, bookingId: data.bookingId });

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "MBA Suites <onboarding@resend.dev>",
      to: [data.guestEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
```

---

## 5. Set Up Secrets

In your Supabase Dashboard → Settings → Edge Functions → Secrets, add:

| Secret Name | Value |
|------------|-------|
| `RESEND_API_KEY` | Your Resend API key from https://resend.com/api-keys |

**Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available.

---

## 6. Deploy the Functions

```bash
# Deploy all functions
supabase functions deploy sync-calendars --project-ref ehpdimadogtqzarriuzz
supabase functions deploy send-booking-email --project-ref ehpdimadogtqzarriuzz
```

---

## 7. Update Your App's Environment Variables

After deploying, update your app to point to the new Supabase project:

```env
VITE_SUPABASE_PROJECT_ID="ehpdimadogtqzarriuzz"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocGRpbWFkb2d0cXphcnJpdXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzc4NDQsImV4cCI6MjA4MTY1Mzg0NH0.TpvSgl4Ove0NQwRb9gYp3_UJTHgGKZCzAlkY9Ejzvv8"
VITE_SUPABASE_URL="https://ehpdimadogtqzarriuzz.supabase.co"
```

---

## Summary

1. ✅ Run `database-export.sql` in your new project's SQL Editor
2. ✅ Create the edge function files as shown above
3. ✅ Add `RESEND_API_KEY` secret in Edge Functions settings
4. ✅ Deploy using `supabase functions deploy`
5. ✅ Update your app's environment variables
