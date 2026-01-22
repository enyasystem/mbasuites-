// Ambient declarations for Deno remote imports used in Supabase Edge Functions
// This file prevents the TypeScript language server from complaining about
// remote import URLs when editing the functions locally.

declare module "https://deno.land/std@0.201.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  export type ServeInit = any;
}
