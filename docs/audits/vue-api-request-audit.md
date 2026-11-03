# Vue API request-frequency audit

Audit date: 2026-11-04. Scope: Vue 3 + Capacitor client source on the follow-up branch. This is a source-level request inventory; production browser Network logs and Laravel throttle logs were not available, so it does not prove the complete production cause of any 429 response.

## Repeated request sources

| Source | Before | Current branch | Reason / guard |
|---|---:|---:|---|
| `POST /presence/heartbeat` | Every 5 seconds = 12/min per active tab | Every 15 seconds = 4/min per active tab | Single-flight coalesces overlapping visibility/lifecycle/timer calls. Kept for durable last-seen and crash recovery. |
| `GET /user` from router guards | Once on every protected navigation | Once after token changes / first protected navigation | Successful verification is cached for the current token; concurrent guards share one promise. Axios still handles later 401/403 responses. |
| Push token registration from `router.afterEach` | POST on every route transition while a token exists | One POST per token + endpoint scope, then skipped while unchanged | Successful token/scope stored and concurrent registrations coalesced. Re-registers if token or authenticated/public endpoint changes. |
| `GET /notifications` | Every 20 seconds = 3/min while Notifications page is visible | Every 60 seconds = 1/min | Push delivery remains the immediate alert path; this poll is recovery sync. |
| Gateway payment status | Every 5 seconds = 12/min while payment modal is active | Every 10 seconds = 6/min | Kept while a payment is pending because only a server-verified terminal state can confirm wallet credit. Foreground resume still triggers an immediate check. |
| Pending wallet top-ups | Every 30 seconds = 2/min | Every 60 seconds = 1/min while page visible | Recovery/history refresh; also refreshed after terminal payment outcomes. |
| Pending withdrawals | Every 30 seconds = 2/min | Every 60 seconds = 1/min while page visible | Recovery/history refresh; background polling paused. |
| Dashboard games | Every 30 seconds = 2/min while visible | Unchanged: 2/min | Kept for fresh game/result data. This call supplies a timestamp query and no-cache headers, intentionally bypassing the generic 2-minute GET cache. |
| Live Support history fallback | 30 seconds while API-connected but Pusher is unavailable; otherwise 5/10/20/40/60-second exponential backoff while disconnected | Unchanged | Fallback is disabled while realtime is connected; single-flight prevents overlapping history syncs. |
| Dashboard clock / activity rotation | 1–5 seconds | Unchanged | Local UI timers only; no HTTP request. |

## Other one-shot / cached API paths reviewed

- `useSettings()` shares one in-flight request and caches the complete allow-listed settings payload for the app session.
- Axios GET cache policies are explicit: settings (5 minutes), games list (2 minutes, bypassed by Dashboard's no-cache query), result chart (1 minute), wallet payment methods (30 seconds), notifications (5 seconds), FAQs (5 minutes), and app update (5 minutes).
- Wallet, payment creation/status, withdrawal, betting, and transaction mutations are not placed in the response cache.
- Dashboard, Monthly Chart, Play History, Play, Profile, Referral, and Auth page requests are user/page-triggered or mount-time requests; no independent recurring timer was found in those views.
- `/notifications-count` exists in Laravel routes, but no current Vue caller was found in the audited client paths.

## Measurement support

Development builds expose `window.__APP_API_CACHE_DIAGNOSTICS__()`, including:
- cache diagnostics,
- total actual HTTP requests,
- actual requests in the trailing 60 seconds,
- request totals by URL path.

This is per browser/app runtime and is not production telemetry. Use it alongside DevTools Network export and Laravel rate-limit logs to establish actual request rates and 429 keys.

## Expected frequency changes

- Heartbeat: 12 -> 4 requests/minute/tab (66.7% reduction).
- Notifications list: 3 -> 1 request/minute while visible (66.7% reduction).
- Active payment status: 12 -> 6 requests/minute while modal remains pending (50% reduction).
- Pending top-up / withdrawal lists: 2 -> 1 request/minute while visible (50% reduction).
- Auth verification: repeated per protected route transition -> one successful verification per token, with concurrent guards coalesced.
- Push token registration: repeated per route transition -> one successful registration per unchanged token/endpoint/platform scope.

These are deterministic source-level schedules, not observed production totals. Multiple tabs have independent JavaScript runtimes and therefore multiply timer-driven request rates; Pusher Presence membership identifies the account across tabs, while database heartbeat sessions remain separate per tab/device.
