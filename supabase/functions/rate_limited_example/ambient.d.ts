declare module "https://deno.land/std@0.201.0/http/server.ts" {
  // Minimal typing for `serve` used in this example. Adjust if you use more APIs from std.
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
