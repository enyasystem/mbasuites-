// Supabase Function: upload-room-media
// Accepts multipart/form-data with fields: file (binary), room_id (optional)
// Validates MIME type and size, uploads to `room-media` storage using the service role key,
// and returns the public URL for the uploaded file.

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore: Remote import (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Remote import (Deno runtime)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
/* eslint-enable @typescript-eslint/ban-ts-comment */

serve(async (req: Request) => {
  // Build per-request CORS headers. Use the request Origin when present so we
  // don't return Access-Control-Allow-Origin: * together with
  // Access-Control-Allow-Credentials: true (which is disallowed).
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '600',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const denoGet = (globalThis as unknown as { Deno?: { env?: { get(k: string): string | undefined } } }).Deno?.env?.get;
    if (!denoGet) throw new Error('Deno.env.get is not available');
    const SUPABASE_URL = denoGet('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = denoGet('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase env vars');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const roomId = (form.get('room_id') as string | null) || undefined;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Allowed types and max size
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

    if (!ALLOWED.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    if (bytes.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'File too large' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Optional authentication: require Authorization Bearer <token> and check role
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.split(' ')[1];

    // Validate token by asking Supabase auth for the user
    const { data: userData, error: userErr } = await supabase.auth.getUser(token as string);
    if (userErr || !userData?.user) {
      console.error('upload-room-media: invalid token', { userErr });
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const user = userData.user;
    console.debug('upload-room-media: authenticated user', { userId: user.id, origin });

    // Check minimal admin/staff role in `profiles` table (assumes `profiles.role` exists).
    // If a `profiles` row is missing, fall back to a possible `role` in user.user_metadata.
    try {
      type ProfileRow = { role?: string | null };
      const { data: profile, error: profErr } = await supabase
        .from<ProfileRow>('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profErr) {
        console.warn('upload-room-media: profiles select returned error', { profErr });
      }

      const roleFromProfile = profile?.role;
      type UserMetadata = { role?: string | null } & Record<string, unknown>;
      const userMetadata = user.user_metadata as UserMetadata | undefined;
      const roleFromMetadata = typeof userMetadata?.role === 'string' ? userMetadata.role : undefined;
      const role = roleFromProfile ?? roleFromMetadata ?? '';

      console.debug('upload-room-media: role check', { roleFromProfile, roleFromMetadata, effectiveRole: role });

      if (!(role === 'admin' || role === 'staff')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } catch (e) {
      console.error('upload-room-media: profile check exception', e);
      return new Response(JSON.stringify({ error: 'Profile check failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Build a safe filename
    const ext = (file.name || '').split('.').pop() || (file.type === 'image/png' ? 'png' : 'jpg');
    const slug = roomId ? `room-${roomId}` : 'room';
    const fname = `${slug}-${Date.now()}-${crypto.randomUUID().slice(0,8)}.${ext}`;
    const path = `room-images/${fname}`;

    // Upload using service role
    const uploadRes = await supabase.storage.from('room-media').upload(path, bytes, { contentType: file.type });
    if (uploadRes.error) {
      console.error('Upload error', uploadRes.error);
      return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: publicUrl } = supabase.storage.from('room-media').getPublicUrl(path);

    return new Response(JSON.stringify({ success: true, publicUrl: publicUrl?.publicUrl }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('upload-room-media error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
