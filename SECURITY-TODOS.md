# Security & Project TODOs

This file consolidates the current project TODOs with a prioritized security checklist (High / Medium / Low). Use these as actionable tickets; mark items done in the project's tracker when implemented.

---

## Summary
- Location / feature work: Enugu seeded, many TypeScript & lint fixes applied.
- Primary security focus: protect data (bookings, payments, users), lock down Supabase, secure uploads, and harden CI/deploy pipeline.

---

## High Priority
- [ ] SEC: Remove client `service_role` keys
  - Ensure no service_role or other privileged keys are bundled client-side. Move privileged operations to server/edge functions and store secrets in environment variables/secret manager.
- [ ] SEC: Enable Row-Level Security (RLS) on sensitive tables
  - Add narrow policies for `anon`, `authenticated`, and `admin` roles for tables: `bookings`, `payments`, `users`, `room_media`, `rooms` (where necessary).
- [ ] SEC: Server-side validation for bookings & payments
  - Validate amounts, ownership, availability, and authentication server-side (edge functions/webhooks). Never trust client-provided totals.
- [ ] SEC: Restrict storage uploads & validate files
  - Enforce allowed file types, size limits, content-type checks, and scan uploads for malware. Prefer signed, time-limited upload URLs.
- [ ] SEC: Enforce secure cookie & session settings
  - Set `HttpOnly`, `Secure`, `SameSite` (lax/strict as appropriate), token rotation, and session revocation endpoints.
- [ ] SEC: Add Content Security Policy (CSP) + security headers
  - Implement CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.
- [ ] SEC: Verify payment webhook signatures
  - Validate incoming webhook signatures and replay protection for payment provider webhooks.

## Medium Priority
- [ ] SEC: Implement rate limiting & abuse protection
  - Rate limit auth endpoints, booking creation, and file uploads; add throttling and IP-based mitigations.
- [ ] SEC: Lock down CORS to production origins
  - Avoid wildcard origins; restrict to your official domains for production.
- [ ] SEC: Enforce HTTPS, HSTS and security headers at the edge
  - Ensure TLS-only traffic and add HSTS header with a long `max-age` for production.
- [ ] SEC: Dependency scanning & automated audits in CI
  - Run `npm audit`, enable Dependabot/Renovate, and fail builds on critical vulnerabilities.
- [ ] SEC: Add SAST/DAST scanning to CI pipeline
  - Integrate CodeQL or similar SAST and a DAST scanner for staging deployments.
- [ ] SEC: Logging, monitoring, and alerting for anomalies
  - Centralize logs (Sentry/Datadog), audit admin actions, and alert on failed logins/large uploads.
- [ ] SEC: Backup & recovery plan for DB
  - Scheduled encrypted backups and tested restore runbooks.
- [ ] SEC: Add tests for auth & payment flows in CI
  - Protect regressions and verify server-side validation.

## Low Priority / Maintenance
- [ ] Verify multi-file uploads in `src/components/admin/RoomMediaManager.tsx`
- [ ] Fix currency conversion when switching currencies
- [ ] Fix remaining ESLint fast-refresh warnings in UI components
- [ ] Fix `src/components/admin/BookingsManager.tsx` (replace any `any` types)
- [ ] Manual QA: verify Enugu appears and bookings work
- [ ] Re-run lint and confirm zero errors

---

## Next recommended action
1. Immediately audit the repository for exposed keys (search for `SERVICE_ROLE` / `service_role` / `SUPABASE_SERVICE_ROLE`).
2. Add RLS on `bookings` and `payments` with minimal policies in staging before production.

---

## Notes
- For each SEC item, create a focused ticket that includes: the responsible owner, acceptance criteria, deploy/rollback plan, and tests.
- If you want, I can open PR templates and example RLS policies / example CSP header snippets.
