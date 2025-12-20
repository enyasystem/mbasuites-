import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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